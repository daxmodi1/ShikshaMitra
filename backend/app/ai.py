import io
import json
import os
import shutil
from tempfile import NamedTemporaryFile
from typing import List, Dict
from collections import defaultdict
from groq import Groq
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import settings
from app.db import search_ncert, insert_documents, get_teacher_profile
from app.schemas import AIResponse

client = Groq(api_key=settings.GROQ_API_KEY)

# Buffer Memory - stores conversation history per chat session
# Key: session_id, Value: list of {"role": "user"|"assistant", "content": str}
conversation_memory: Dict[str, List[dict]] = defaultdict(list)
MAX_MEMORY_MESSAGES = 10 

ANALYTICS_PROMPT = """
You are Shiksha Mitra, an AI mentor for teachers.
Your role is to help with both NCERT curriculum content AND general teaching/classroom management advice.

CONTEXT FROM NCERT (if available):
{context}

CONVERSATION HISTORY (for context):
{conversation_summary}

INSTRUCTIONS:
1. **CONCISENESS (MOST IMPORTANT):** 
   - KEEP ANSWERS VERY SHORT AND DIRECT
   - Maximum 2-3 short paragraphs (80-120 words total)
   - Hindi answers should be as concise as English answers
   - Do NOT repeat information
   - Do NOT add extra examples unless asked
   - Use bullet points instead of lengthy paragraphs

2. **LANGUAGE DETECTION:** Detect the language of the user's query (Hindi, English, or Hinglish).

3. **RESPONSE LANGUAGE:** You MUST reply in the **SAME language** as the query.
   - If query is Hindi -> Answer in Hindi (Devanagari)
   - If query is English -> Answer in English
   - If query is Hinglish -> Answer in Hindi/Hinglish
   - **IMPORTANT:** Same conciseness rules apply to ALL languages

4. **QUERY TYPE DETECTION:**
   - **NCERT Questions:** If the query is about curriculum, textbooks, or specific subjects → Use the provided NCERT context
   - **General Teaching:** If the query is about classroom management, teaching techniques, student engagement, discipline, etc. → Use your pedagogical knowledge
   - **Mixed:** If both apply → Combine NCERT content with general teaching advice

5. **FORMATTING:** Format your answer with:
   - Bullet points (• or -) for key points only
   - Bold **text** for emphasis
   - Numbers (1. 2. 3.) for short lists only
   - Keep it scannable and brief
   - Avoid long paragraphs

6. **RESPONSE APPROACH:**
   - Give direct answers without elaboration
   - If NCERT context is provided and relevant: Use it as primary source
   - If NCERT context is empty or not relevant: Provide expert teaching advice based on best practices
   - Include only practical, actionable points
   - Skip unnecessary examples unless specifically asked
   - NO lengthy explanations - be brief and to the point

7. **ANALYTICS:** Classify the query topic and sentiment.

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT:
{{
  "answer": "Brief, formatted answer (2-3 short paragraphs max, 80-120 words) with bullet points and bold text...",
  "topic": "Classroom Management" or "Pedagogy" or "Subject Knowledge" or "Student Engagement" or "Curriculum",
  "sentiment": "Curious" or "Frustrated" or "Urgent" or "Neutral" or "Seeking Help",
  "language": "Hindi" or "English",
  "actions": ["Action 1", "Action 2"]
}}
"""

async def transcribe_audio(file_bytes: bytes, filename: str) -> str:
    try:
        audio_file = io.BytesIO(file_bytes)
        audio_file.name = filename
        
        transcription = client.audio.transcriptions.create(
            file=(filename, audio_file.read()),
            model=settings.STT_MODEL,
            temperature=0.0
        )
        transcribed_text = transcription.text.strip()
        
        # Debug logging
        print(f"[Transcription] File: {filename} | Text: {transcribed_text}")
        
        return transcribed_text
    except Exception as e:
        print(f"Whisper Error: {e}")
        return ""

def get_conversation_history(session_id: str) -> List[dict]:
    """Get recent conversation history for a chat session."""
    return conversation_memory[session_id][-MAX_MEMORY_MESSAGES:]

def add_to_memory(session_id: str, role: str, content: str):
    """Add a message to the conversation memory for a specific chat session."""
    conversation_memory[session_id].append({"role": role, "content": content})
    # Trim to keep only last MAX_MEMORY_MESSAGES
    if len(conversation_memory[session_id]) > MAX_MEMORY_MESSAGES:
        conversation_memory[session_id] = conversation_memory[session_id][-MAX_MEMORY_MESSAGES:]

def clear_memory(session_id: str):
    """Clear conversation memory for a chat session."""
    conversation_memory[session_id] = []

def build_conversation_summary(session_id: str) -> str:
    """Build a text summary of recent conversation for context."""
    history = get_conversation_history(session_id)
    if not history:
        return "No previous conversation."
    
    summary_parts = []
    for msg in history:
        role = "Teacher" if msg["role"] == "user" else "Assistant"
        # Truncate long messages for summary
        content = msg["content"][:200] + "..." if len(msg["content"]) > 200 else msg["content"]
        summary_parts.append(f"{role}: {content}")
    
    return "\n".join(summary_parts)

async def generate_smart_answer(query: str, context: str, session_id: str) -> dict:
    # Build conversation summary for context
    conversation_summary = build_conversation_summary(session_id)
    formatted_prompt = ANALYTICS_PROMPT.format(context=context, conversation_summary=conversation_summary)
    
    # Build messages with conversation history
    messages = [{"role": "system", "content": formatted_prompt}]
    
    # Add conversation history for context
    history = get_conversation_history(session_id)
    messages.extend(history)
    
    # Add current query
    messages.append({"role": "user", "content": query})
    
    try:
        chat = client.chat.completions.create(
            messages=messages,
            model=settings.LLM_MODEL,
            temperature=0.5,
            response_format={"type": "json_object"}
        )
        response_content = chat.choices[0].message.content
        result = json.loads(response_content)
        
        # Add to memory
        add_to_memory(session_id, "user", query)
        add_to_memory(session_id, "assistant", result.get("answer", ""))
        
        return result
    except Exception as e:
        print(f"LLM Error: {e}")
        return {
            "answer": "Sorry, I encountered an error. Please try again.",
            "topic": "Error",
            "sentiment": "Neutral",
            "language": "Unknown",
            "actions": []
        }

async def run_ai_pipeline(query_text: str, session_id: str) -> AIResponse:
    # For short/referential queries, include previous query context in RAG search
    search_query = query_text
    history = get_conversation_history(session_id)
    
    # If query is short and there's history, combine with previous user query for better RAG
    if len(query_text.split()) <= 5 and history:
        # Find last user message
        last_user_msgs = [m for m in history if m["role"] == "user"]
        if last_user_msgs:
            last_query = last_user_msgs[-1]["content"]
            search_query = f"{last_query} {query_text}"
            print(f"[RAG] Short query detected. Extended search query: {search_query}")
    
    # Try to search NCERT for relevant context
    docs = search_ncert(search_query)
    context_str = "\n\n".join(docs) if docs else ""
    
    # If no NCERT context found, provide guidance without context
    if not context_str:
        print(f"[Pipeline] No NCERT context found for query: {query_text}")
        context_str = "[No specific NCERT content found for this topic. Providing general teaching guidance.]"
    else:
        print(f"[Pipeline] Found {len(docs)} NCERT documents")
    
    ai_data = await generate_smart_answer(query_text, context_str, session_id)
    
    return AIResponse(
        answer_text=ai_data.get("answer"),
        source_documents=docs,
        suggested_actions=ai_data.get("actions", []),
        detected_topic=ai_data.get("topic", "General"),
        query_sentiment=ai_data.get("sentiment", "Neutral"),
        detected_language=ai_data.get("language", "Unknown")
    )

async def ingest_pdf_pipeline(file_upload):
    with NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file_upload.file, tmp)
        tmp_path = tmp.name

    try:
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", " "]
        )
        chunks = text_splitter.split_documents(docs)

        texts = [c.page_content for c in chunks]
        metadatas = [{"source": file_upload.filename, "page": c.metadata.get("page", 0)} for c in chunks]

        count = insert_documents(texts, metadatas)
        
        return {"status": "success", "chunks_added": count, "filename": file_upload.filename}
        
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)