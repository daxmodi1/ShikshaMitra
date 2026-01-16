from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from app.config import settings
from app.schemas import AIResponse
from app.ai import run_ai_pipeline, transcribe_audio
from app.ai import run_ai_pipeline, transcribe_audio, ingest_pdf_pipeline
app = FastAPI(title=settings.PROJECT_NAME)

@app.get("/")
def root():
    return {"message": "Shiksha Mitra Backend is Running"}

@app.post("/api/process-text", response_model=AIResponse)
async def process_text(query: str, teacher_id: str = "T1"):
    return await run_ai_pipeline(query, teacher_id)

@app.post("/api/process-voice", response_model=AIResponse)
async def process_voice(
    file: UploadFile = File(...), 
    teacher_id: str = Form(...)
):
    # 1. Voice to Text
    file_bytes = await file.read()
    text = await transcribe_audio(file_bytes, file.filename)
    
    if not text:
        raise HTTPException(status_code=400, detail="Audio could not be understood")
    
    # 2. RAG Pipeline
    return await run_ai_pipeline(text, teacher_id)

@app.post("/api/ingest-pdf")
async def ingest_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF (e.g., new NCERT Circular).
    LangChain will chunk it and ChromaDB will embed it.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
    return await ingest_pdf_pipeline(file)