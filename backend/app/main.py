from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from typing import List
import uuid

from app.config import settings
from app.schemas import (
    AIResponse, LoginRequest, LoginResponse, SignupRequest, QueryRequest, 
    ChatHistoryResponse, TeacherProfileResponse
)
from app.ai import run_ai_pipeline, transcribe_audio, ingest_pdf_pipeline, clear_memory, add_to_memory
from app.auth import (
    verify_password, create_access_token, get_current_user, 
    get_current_crp, get_current_teacher, ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.database import (
    get_user_by_email, get_teacher_by_id, get_teachers_by_crp,
    save_chat_message, get_teacher_chat_history, get_crp_chat_history,
    get_crp_analytics
)
from app.models import ChatMessage

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Configuration - Allow all origins for deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Shiksha Mitra Backend is Running"}

# Authentication Endpoints
@app.get("/api/crps")
async def get_crps():
    """Get all CRPs for teacher signup dropdown"""
    from app.database import get_all_crps
    crps = get_all_crps()
    return [{"id": crp.id, "name": crp.name, "email": crp.email} for crp in crps]

@app.post("/api/auth/signup")
async def signup(request: SignupRequest):
    """Register a new user (CRP or Teacher)"""
    from app.database import create_user
    
    # Check if email already exists
    existing_user = get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    if request.role not in ["crp", "teacher"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'crp' or 'teacher'")
    
    # Create user
    user = create_user(
        email=request.email,
        password=request.password,
        name=request.name,
        role=request.role,
        grade=request.grade,
        subject=request.subject,
        location=request.location,
        crp_id=request.crp_id
    )
    
    # Generate access token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return LoginResponse(
        access_token=access_token,
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        crp_id=user.crp_id
    )

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    user = get_user_by_email(credentials.email)
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return LoginResponse(
        access_token=access_token,
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        crp_id=user.crp_id
    )

# Teacher Endpoints
@app.post("/api/teacher/query", response_model=AIResponse)
async def teacher_text_query(
    request: QueryRequest,
    current_user: dict = Depends(get_current_teacher)
):
    teacher_id = current_user["user_id"]
    
    # Generate session_id if not provided (new chat)
    session_id = request.session_id or str(uuid.uuid4())
    
    # If chat history is provided, populate the memory with it
    if request.chat_history:
        clear_memory(teacher_id)
        for msg in request.chat_history:
            if msg.role in ["user", "assistant"]:
                add_to_memory(teacher_id, msg.role, msg.text)
    
    response = await run_ai_pipeline(request.query_text, teacher_id)
    
    # Save to chat history with session_id
    from app.models import ChatMessage
    chat_msg = ChatMessage(
        id=str(uuid.uuid4()),
        session_id=session_id,
        teacher_id=teacher_id,
        query_text=request.query_text,
        answer_text=response.answer_text,
        detected_topic=response.detected_topic,
        query_sentiment=response.query_sentiment,
        detected_language=response.detected_language,
        source_type="text"
    )
    save_chat_message(chat_msg)
    
    # Return session_id with response
    response_dict = response.dict()
    response_dict["session_id"] = session_id
    return response_dict

@app.post("/api/teacher/query-voice", response_model=AIResponse)
async def teacher_voice_query(
    file: UploadFile = File(...),
    chat_history: str = Form(None),
    current_user: dict = Depends(get_current_teacher)
):
    teacher_id = current_user["user_id"]
    
    # If chat history is provided, populate the memory with it
    if chat_history:
        try:
            import json
            history_list = json.loads(chat_history)
            clear_memory(teacher_id)
            from app.schemas import ChatMessage
            for msg in history_list:
                if isinstance(msg, dict) and msg.get("role") in ["user", "assistant"]:
                    add_to_memory(teacher_id, msg.get("role"), msg.get("text", ""))
        except:
            pass
    
    file_bytes = await file.read()
    text = await transcribe_audio(file_bytes, file.filename)
    
    if not text:
        raise HTTPException(status_code=400, detail="Audio could not be understood")
    
    response = await run_ai_pipeline(text, teacher_id)
    
    # Save to chat history
    from app.models import ChatMessage as DBChatMessage
    chat_msg = DBChatMessage(
        id=str(uuid.uuid4()),
        teacher_id=teacher_id,
        query_text=text,
        answer_text=response.answer_text,
        detected_topic=response.detected_topic,
        query_sentiment=response.query_sentiment,
        detected_language=response.detected_language,
        source_type="voice"
    )
    save_chat_message(chat_msg)
    
    return response

@app.post("/api/teacher/clear-memory")
async def clear_conversation_memory(
    current_user: dict = Depends(get_current_teacher)
):
    """Clear the conversation buffer memory for the current teacher."""
    teacher_id = current_user["user_id"]
    clear_memory(teacher_id)
    return {"message": "Conversation memory cleared successfully"}

@app.get("/api/teacher/history", response_model=List[ChatHistoryResponse])
async def get_teacher_history(
    current_user: dict = Depends(get_current_teacher)
):
    teacher_id = current_user["user_id"]
    history = get_teacher_chat_history(teacher_id)
    teacher = get_teacher_by_id(teacher_id)
    
    return [
        ChatHistoryResponse(
            id=msg.id,
            teacher_id=msg.teacher_id,
            teacher_name=teacher.name if teacher else "Unknown",
            query_text=msg.query_text,
            answer_text=msg.answer_text,
            detected_topic=msg.detected_topic,
            query_sentiment=msg.query_sentiment,
            detected_language=msg.detected_language,
            source_type=msg.source_type,
            timestamp=msg.timestamp
        )
        for msg in history
    ]

@app.get("/api/teacher/sessions")
async def get_teacher_sessions(
    current_user: dict = Depends(get_current_teacher)
):
    """Get all chat sessions grouped by session_id"""
    from app.database import get_teacher_sessions
    teacher_id = current_user["user_id"]
    sessions = get_teacher_sessions(teacher_id)
    return sessions

@app.get("/api/teacher/profile", response_model=TeacherProfileResponse)
async def get_teacher_profile(
    current_user: dict = Depends(get_current_teacher)
):
    teacher = get_teacher_by_id(current_user["user_id"])
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    
    return TeacherProfileResponse(**teacher.dict())

# CRP Endpoints
@app.get("/api/crp/teachers", response_model=List[TeacherProfileResponse])
async def get_crp_teachers(
    current_user: dict = Depends(get_current_crp)
):
    teachers = get_teachers_by_crp(current_user["user_id"])
    return [TeacherProfileResponse(**t.dict()) for t in teachers]

@app.get("/api/crp/chats", response_model=List[ChatHistoryResponse])
async def get_crp_chats(
    current_user: dict = Depends(get_current_crp)
):
    history = get_crp_chat_history(current_user["user_id"])
    
    return [
        ChatHistoryResponse(
            id=msg.id,
            teacher_id=msg.teacher_id,
            teacher_name=get_teacher_by_id(msg.teacher_id).name if get_teacher_by_id(msg.teacher_id) else "Unknown",
            query_text=msg.query_text,
            answer_text=msg.answer_text,
            detected_topic=msg.detected_topic,
            query_sentiment=msg.query_sentiment,
            detected_language=msg.detected_language,
            source_type=msg.source_type,
            timestamp=msg.timestamp
        )
        for msg in history
    ]

@app.get("/api/crp/teacher/{teacher_id}/chats", response_model=List[ChatHistoryResponse])
async def get_specific_teacher_chats(
    teacher_id: str,
    current_user: dict = Depends(get_current_crp)
):
    # Verify teacher belongs to this CRP
    teacher = get_teacher_by_id(teacher_id)
    if not teacher or teacher.crp_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied to this teacher's data")
    
    history = get_teacher_chat_history(teacher_id)
    
    return [
        ChatHistoryResponse(
            id=msg.id,
            teacher_id=msg.teacher_id,
            teacher_name=teacher.name,
            query_text=msg.query_text,
            answer_text=msg.answer_text,
            detected_topic=msg.detected_topic,
            query_sentiment=msg.query_sentiment,
            detected_language=msg.detected_language,
            source_type=msg.source_type,
            timestamp=msg.timestamp
        )
        for msg in history
    ]

@app.get("/api/crp/analytics")
async def get_analytics(
    current_user: dict = Depends(get_current_crp)
):
    analytics = get_crp_analytics(current_user["user_id"])
    return analytics.dict()

# Admin/Utility Endpoints (kept for backward compatibility)
@app.post("/api/ingest-pdf")
async def ingest_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
    return await ingest_pdf_pipeline(file)