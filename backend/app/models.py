from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    CRP = "crp"
    TEACHER = "teacher"

class User(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: UserRole
    password_hash: str
    crp_id: Optional[str] = None  # For teachers, this links them to their CRP
    created_at: datetime = datetime.now()

class Teacher(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    grade: str
    subject: str
    location: str
    crp_id: str
    total_queries: int = 0
    last_active: Optional[datetime] = None

class ChatMessage(BaseModel):
    id: str
    session_id: str  # New: groups messages into conversations
    teacher_id: str
    query_text: str
    answer_text: str
    detected_topic: str
    query_sentiment: str
    detected_language: str
    source_type: str  # "text" or "voice"
    timestamp: datetime = datetime.now()

class CRPAnalytics(BaseModel):
    crp_id: str
    total_teachers: int
    active_teachers_today: int
    total_queries_today: int
    top_topics: List[dict]
    sentiment_distribution: dict
    language_distribution: dict
