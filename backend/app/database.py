from typing import List, Optional, Dict
from datetime import datetime, timedelta
from collections import Counter
import json
from app.models import User, Teacher, ChatMessage, CRPAnalytics, UserRole
from app.auth import get_password_hash

# In-memory database (replace with real database in production)
users_db: Dict[str, User] = {}
teachers_db: Dict[str, Teacher] = {}
chat_history_db: List[ChatMessage] = []

# Initialize demo data
def initialize_demo_data():
    global users_db, teachers_db
    
    # Create CRP users
    users_db["crp1"] = User(
        id="crp1",
        email="crp1@shiksha.com",
        name="Rajesh Kumar",
        role=UserRole.CRP,
        password_hash=get_password_hash("password123")
    )
    
    users_db["crp2"] = User(
        id="crp2",
        email="crp2@shiksha.com",
        name="Priya Sharma",
        role=UserRole.CRP,
        password_hash=get_password_hash("password123")
    )
    
    # Create Teacher users and profiles
    teachers_data = [
        {"id": "T1", "name": "Amit Singh", "email": "amit@school.com", "grade": "5", "subject": "Math", "location": "Rural", "crp_id": "crp1"},
        {"id": "T2", "name": "Sneha Patel", "email": "sneha@school.com", "grade": "3", "subject": "Science", "location": "Urban", "crp_id": "crp1"},
        {"id": "T3", "name": "Rahul Verma", "email": "rahul@school.com", "grade": "7", "subject": "English", "location": "Semi-Urban", "crp_id": "crp1"},
        {"id": "T4", "name": "Kavita Devi", "email": "kavita@school.com", "grade": "4", "subject": "Hindi", "location": "Rural", "crp_id": "crp2"},
    ]
    
    for t in teachers_data:
        # Create user account
        users_db[t["id"]] = User(
            id=t["id"],
            email=t["email"],
            name=t["name"],
            role=UserRole.TEACHER,
            password_hash=get_password_hash("teacher123"),
            crp_id=t["crp_id"]
        )
        
        # Create teacher profile
        teachers_db[t["id"]] = Teacher(
            id=t["id"],
            name=t["name"],
            email=t["email"],
            grade=t["grade"],
            subject=t["subject"],
            location=t["location"],
            crp_id=t["crp_id"]
        )

# User operations
def get_user_by_email(email: str) -> Optional[User]:
    for user in users_db.values():
        if user.email == email:
            return user
    return None

def get_user_by_id(user_id: str) -> Optional[User]:
    return users_db.get(user_id)

# Teacher operations
def get_teacher_by_id(teacher_id: str) -> Optional[Teacher]:
    return teachers_db.get(teacher_id)

def get_teachers_by_crp(crp_id: str) -> List[Teacher]:
    return [t for t in teachers_db.values() if t.crp_id == crp_id]

# Chat operations
def save_chat_message(message: ChatMessage):
    chat_history_db.append(message)
    
    # Update teacher stats
    teacher = teachers_db.get(message.teacher_id)
    if teacher:
        teacher.total_queries += 1
        teacher.last_active = datetime.now()

def get_teacher_chat_history(teacher_id: str, limit: int = 50) -> List[ChatMessage]:
    teacher_chats = [msg for msg in chat_history_db if msg.teacher_id == teacher_id]
    return sorted(teacher_chats, key=lambda x: x.timestamp, reverse=True)[:limit]

def get_crp_chat_history(crp_id: str, limit: int = 100) -> List[ChatMessage]:
    # Get all teachers under this CRP
    teacher_ids = [t.id for t in teachers_db.values() if t.crp_id == crp_id]
    
    # Get chats for these teachers
    crp_chats = [msg for msg in chat_history_db if msg.teacher_id in teacher_ids]
    return sorted(crp_chats, key=lambda x: x.timestamp, reverse=True)[:limit]

def get_crp_analytics(crp_id: str) -> CRPAnalytics:
    teachers = get_teachers_by_crp(crp_id)
    teacher_ids = [t.id for t in teachers]
    
    # Get today's chats
    today = datetime.now().date()
    today_chats = [msg for msg in chat_history_db 
                   if msg.teacher_id in teacher_ids and msg.timestamp.date() == today]
    
    # Active teachers today
    active_teacher_ids = set(msg.teacher_id for msg in today_chats)
    
    # Topic distribution
    all_chats = [msg for msg in chat_history_db if msg.teacher_id in teacher_ids]
    topics = Counter(msg.detected_topic for msg in all_chats)
    top_topics = [{"topic": topic, "count": count} for topic, count in topics.most_common(5)]
    
    # Sentiment distribution
    sentiments = Counter(msg.query_sentiment for msg in all_chats)
    sentiment_dist = dict(sentiments)
    
    # Language distribution
    languages = Counter(msg.detected_language for msg in all_chats)
    language_dist = dict(languages)
    
    return CRPAnalytics(
        crp_id=crp_id,
        total_teachers=len(teachers),
        active_teachers_today=len(active_teacher_ids),
        total_queries_today=len(today_chats),
        top_topics=top_topics,
        sentiment_distribution=sentiment_dist,
        language_distribution=language_dist
    )

# Initialize on import
initialize_demo_data()
