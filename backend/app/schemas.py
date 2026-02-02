from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class AIResponse(BaseModel):
    answer_text: str
    source_documents: List[str] = []
    suggested_actions: List[str] = []
    
    detected_topic: str = "General"
    query_sentiment: str = "Neutral"
    detected_language: str = "Unknown"
    session_id: Optional[str] = None  # New: return session_id to frontend

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str  # "crp" or "teacher"
    grade: Optional[str] = None
    subject: Optional[str] = None
    location: Optional[str] = None
    crp_id: Optional[str] = None  # For teachers

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str
    role: str
    crp_id: Optional[str] = None

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    text: str
    timestamp: Optional[datetime] = None

class QueryRequest(BaseModel):
    query_text: str
    chat_history: Optional[List[ChatMessage]] = None
    session_id: Optional[str] = None  # New: track conversation session
    
class ChatHistoryResponse(BaseModel):
    id: str
    teacher_id: str
    teacher_name: str
    query_text: str
    answer_text: str
    detected_topic: str
    query_sentiment: str
    detected_language: str
    source_type: str
    timestamp: datetime

class TeacherProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    grade: str
    subject: str
    location: str
    total_queries: int
    last_active: Optional[datetime]