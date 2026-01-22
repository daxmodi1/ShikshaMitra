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

# Buffer Memory - stores conversation history per teacher
# Key: teacher_id, Value: list of {"role": "user"|"assistant", "content": str}
conversation_memory: Dict[str, List[dict]] = defaultdict(list)
MAX_MEMORY_MESSAGES = 10  # Keep last 10 exchanges (5 user + 5 assistant)

ANALYTICS_PROMPT = """
You are Shiksha Mitra, an AI mentor for teachers.
CONTEXT FROM NCERT: {context}

CONVERSATION HISTORY (for context):
{conversation_summary}

INSTRUCTIONS:
1. **LANGUAGE DETECTION:** Detect the language of the user's query (Hindi, English, or Hinglish).
2. **RESPONSE LANGUAGE:** You MUST reply in the **SAME language** as the query.
   - If query is Hindi -> Answer in Hindi (Devanagari).
   - If query is English -> Answer in English.
   - If query is Hinglish -> Answer in Hindi/Hinglish.
3. **TASK:** Answer the teacher's query using the provided Context. If the user's query refers to previous conversation (like "give answers", "explain more", "what about..."), use the conversation history to understand what they're referring to.
4. **ANALYTICS:** Classify the query topic and sentiment.

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT:
{{
  "answer": "Your helpful answer here in the user's language...",
  "topic": "Classroom Management" (or Pedagogy, Subject Knowledge, etc.),
  "sentiment": "Curious" (or Frustrated, Urgent, Neutral),
  "language": "Hindi" (or English),
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
        return transcription.text
    except Exception as e:
        print(f"Whisper Error: {e}")
        return ""

def get_conversation_history(teacher_id: str) -> List[dict]:
    """Get recent conversation history for a teacher."""
    return conversation_memory[teacher_id][-MAX_MEMORY_MESSAGES:]

def add_to_memory(teacher_id: str, role: str, content: str):
    """Add a message to the conversation memory."""
    conversation_memory[teacher_id].append({"role": role, "content": content})
    # Trim to keep only last MAX_MEMORY_MESSAGES
    if len(conversation_memory[teacher_id]) > MAX_MEMORY_MESSAGES:
        conversation_memory[teacher_id] = conversation_memory[teacher_id][-MAX_MEMORY_MESSAGES:]

def clear_memory(teacher_id: str):
    """Clear conversation memory for a teacher."""
    conversation_memory[teacher_id] = []

def build_conversation_summary(teacher_id: str) -> str:
    """Build a text summary of recent conversation for context."""
    history = get_conversation_history(teacher_id)
    if not history:
        return "No previous conversation."
    
    summary_parts = []
    for msg in history:
        role = "Teacher" if msg["role"] == "user" else "Assistant"
        # Truncate long messages for summary
        content = msg["content"][:200] + "..." if len(msg["content"]) > 200 else msg["content"]
        summary_parts.append(f"{role}: {content}")
    
    return "\n".join(summary_parts)

async def generate_smart_answer(query: str, context: str, teacher_id: str) -> dict:
    # Build conversation summary for context
    conversation_summary = build_conversation_summary(teacher_id)
    formatted_prompt = ANALYTICS_PROMPT.format(context=context, conversation_summary=conversation_summary)
    
    # Build messages with conversation history
    messages = [{"role": "system", "content": formatted_prompt}]
    
    # Add conversation history for context
    history = get_conversation_history(teacher_id)
    messages.extend(history)
    
    # Add current query
    messages.append({"role": "user", "content": query})
    
    try:
        chat = client.chat.completions.create(
            messages=messages,
            model=settings.LLM_MODEL,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        response_content = chat.choices[0].message.content
        result = json.loads(response_content)
        
        # Add to memory
        add_to_memory(teacher_id, "user", query)
        add_to_memory(teacher_id, "assistant", result.get("answer", ""))
        
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

async def run_ai_pipeline(query_text: str, teacher_id: str) -> AIResponse:
    # For short/referential queries, include previous query context in RAG search
    search_query = query_text
    history = get_conversation_history(teacher_id)
    
    # If query is short and there's history, combine with previous user query for better RAG
    if len(query_text.split()) <= 5 and history:
        # Find last user message
        last_user_msgs = [m for m in history if m["role"] == "user"]
        if last_user_msgs:
            last_query = last_user_msgs[-1]["content"]
            search_query = f"{last_query} {query_text}"
    
    docs = search_ncert(search_query)
    context_str = "\n\n".join(docs)
    
    ai_data = await generate_smart_answer(query_text, context_str, teacher_id)
    
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