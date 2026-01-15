import io
from groq import Groq
from app.config import settings
from app.db import search_ncert, get_teacher_profile
from app.schemas import AIResponse

client = Groq(api_key=settings.GROQ_API_KEY)

# --- 1. System Prompts ---
SYSTEM_PROMPT = """
You are Shiksha Mitra, a mentor for government school teachers in India.
CONTEXT FROM NCERT: {context}
TEACHER PROFILE: {profile}
INSTRUCTIONS:
- Answer in the same language as the user (Hindi/English).
- Keep it practical and under 150 words.
- Cite the NCERT context if used.
"""

# --- 2. Voice Processing (Whisper) ---
async def transcribe_audio(file_bytes: bytes, filename: str) -> str:
    try:
        audio_file = io.BytesIO(file_bytes)
        audio_file.name = filename
        transcription = client.audio.transcriptions.create(
            file=(filename, audio_file.read()),
            model=settings.STT_MODEL,
            language="hi", # Hint Hindi for better accuracy
            temperature=0.0
        )
        return transcription.text
    except Exception as e:
        print(f"Whisper Error: {e}")
        return ""

# --- 3. Text Generation (Llama 3) ---
async def generate_answer(query: str, context: str, profile: dict) -> str:
    formatted_prompt = SYSTEM_PROMPT.format(
        context=context, 
        profile=str(profile)
    )
    
    chat = client.chat.completions.create(
        messages=[
            {"role": "system", "content": formatted_prompt},
            {"role": "user", "content": query}
        ],
        model=settings.LLM_MODEL,
        temperature=0.3
    )
    return chat.choices[0].message.content

# --- 4. Main RAG Pipeline ---
async def run_ai_pipeline(query_text: str, teacher_id: str) -> AIResponse:
    # A. Retrieve
    docs = search_ncert(query_text)
    context_str = "\n".join(docs)
    
    # B. Context
    profile = get_teacher_profile(teacher_id)
    
    # C. Generate
    answer = await generate_answer(query_text, context_str, profile)
    
    return AIResponse(
        answer_text=answer,
        source_documents=docs,
        suggested_actions=["Check Activity 2.1", "Use Peer Grouping"]
    )