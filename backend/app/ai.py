import io
import json
import os
import shutil
from tempfile import NamedTemporaryFile
from groq import Groq
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import settings
from app.db import search_ncert, insert_documents, get_teacher_profile
from app.schemas import AIResponse

client = Groq(api_key=settings.GROQ_API_KEY)

# --- 1. System Prompts (Updated for Language Matching) ---
ANALYTICS_PROMPT = """
You are Shiksha Mitra, an AI mentor for teachers.
CONTEXT FROM NCERT: {context}

INSTRUCTIONS:
1. **LANGUAGE DETECTION:** Detect the language of the user's query (Hindi, English, or Hinglish).
2. **RESPONSE LANGUAGE:** You MUST reply in the **SAME language** as the query.
   - If query is Hindi -> Answer in Hindi (Devanagari).
   - If query is English -> Answer in English.
   - If query is Hinglish -> Answer in Hindi/Hinglish.
3. **TASK:** Answer the teacher's query using the provided Context.
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

# --- 2. Voice Processing (Whisper) ---
async def transcribe_audio(file_bytes: bytes, filename: str) -> str:
    try:
        audio_file = io.BytesIO(file_bytes)
        audio_file.name = filename
        
        # Removed 'language="hi"' to allow auto-detection of English/Hindi
        transcription = client.audio.transcriptions.create(
            file=(filename, audio_file.read()),
            model=settings.STT_MODEL,
            temperature=0.0
        )
        return transcription.text
    except Exception as e:
        print(f"Whisper Error: {e}")
        return ""

# --- 3. Text Generation (Llama 3 + Analytics) ---
async def generate_smart_answer(query: str, context: str) -> dict:
    formatted_prompt = ANALYTICS_PROMPT.format(context=context)
    
    try:
        chat = client.chat.completions.create(
            messages=[
                {"role": "system", "content": formatted_prompt},
                {"role": "user", "content": query}
            ],
            model=settings.LLM_MODEL,
            temperature=0.3,
            response_format={"type": "json_object"} # Enforces JSON output
        )
        return json.loads(chat.choices[0].message.content)
    except Exception as e:
        print(f"LLM Error: {e}")
        # Fallback if JSON fails
        return {
            "answer": "Sorry, I encountered an error. Please try again.",
            "topic": "Error",
            "sentiment": "Neutral",
            "language": "Unknown",
            "actions": []
        }

# --- 4. Main RAG Pipeline ---
async def run_ai_pipeline(query_text: str, teacher_id: str) -> AIResponse:
    # A. Retrieve (Hybrid Search)
    docs = search_ncert(query_text)
    context_str = "\n\n".join(docs)
    
    # B. Generate (Smart Answer)
    ai_data = await generate_smart_answer(query_text, context_str)
    
    # C. Return Structured Response
    return AIResponse(
        answer_text=ai_data.get("answer"),
        source_documents=docs,
        suggested_actions=ai_data.get("actions", []),
        detected_topic=ai_data.get("topic", "General"),
        query_sentiment=ai_data.get("sentiment", "Neutral"),
        detected_language=ai_data.get("language", "Unknown")
    )

# --- 5. PDF Ingestion Pipeline ---
async def ingest_pdf_pipeline(file_upload):
    with NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file_upload.file, tmp)
        tmp_path = tmp.name

    try:
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()
        
        # Chunking Strategy (Optimized for Context)
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", " "]
        )
        chunks = text_splitter.split_documents(docs)

        texts = [c.page_content for c in chunks]
        metadatas = [{"source": file_upload.filename, "page": c.metadata.get("page", 0)} for c in chunks]

        # Insert into DB (Updates Hybrid Index automatically)
        count = insert_documents(texts, metadatas)
        
        return {"status": "success", "chunks_added": count, "filename": file_upload.filename}
        
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)