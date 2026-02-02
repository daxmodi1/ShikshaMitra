from typing import List, Optional, Dict
from datetime import datetime
from collections import Counter
from uuid import uuid4
from app.config import settings
from app.models import User, Teacher, ChatMessage, CRPAnalytics, UserRole
from app.auth import get_password_hash

try:
    from supabase import create_client, Client
except Exception:
    create_client = None
    Client = None

# In-memory database (fallback when Supabase is not configured)
users_db: Dict[str, User] = {}
teachers_db: Dict[str, Teacher] = {}
chat_history_db: List[ChatMessage] = []

supabase: Optional[Client] = None

def _supabase_enabled() -> bool:
    return bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY and create_client)

def _get_supabase_client() -> Optional[Client]:
    global supabase
    if not _supabase_enabled():
        return None
    if supabase is None:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    return supabase

# Initialize demo data
def initialize_demo_data():
    global users_db, teachers_db

    if _supabase_enabled():
        return
    
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
    sb = _get_supabase_client()
    if sb:
        resp = sb.table("users").select("*").eq("email", email).limit(1).execute()
        if resp.data:
            return User(**resp.data[0])
        return None

    for user in users_db.values():
        if user.email == email:
            return user
    return None

def get_user_by_id(user_id: str) -> Optional[User]:
    sb = _get_supabase_client()
    if sb:
        resp = sb.table("users").select("*").eq("id", user_id).limit(1).execute()
        if resp.data:
            return User(**resp.data[0])
        return None

    return users_db.get(user_id)

# Teacher operations
def get_teacher_by_id(teacher_id: str) -> Optional[Teacher]:
    sb = _get_supabase_client()
    if sb:
        resp = sb.table("teachers").select("*").eq("id", teacher_id).limit(1).execute()
        if resp.data:
            return Teacher(**resp.data[0])
        return None

    return teachers_db.get(teacher_id)

def create_user(email: str, password: str, name: str, role: str, **kwargs) -> User:
    """Create a new user in the database"""
    sb = _get_supabase_client()
    
    # Generate user ID
    if role == "teacher":
        user_id = f"T{str(uuid4())[:8]}"
    else:
        user_id = f"crp_{str(uuid4())[:8]}"
    
    # Hash password
    password_hash = get_password_hash(password)
    
    # Create user object
    user = User(
        id=user_id,
        email=email,
        name=name,
        role=UserRole(role),
        password_hash=password_hash,
        crp_id=kwargs.get("crp_id")
    )
    
    if sb:
        # Insert into Supabase
        user_data = user.dict()
        user_data["created_at"] = datetime.now().isoformat()
        sb.table("users").insert(user_data).execute()
        
        # If teacher, create teacher profile
        if role == "teacher":
            teacher = Teacher(
                id=user_id,
                name=name,
                email=email,
                phone=kwargs.get("phone") or "",
                grade=kwargs.get("grade") or "",
                subject=kwargs.get("subject") or "",
                location=kwargs.get("location") or "",
                crp_id=kwargs.get("crp_id") or "",
                total_queries=0
            )
            teacher_data = teacher.dict()
            sb.table("teachers").insert(teacher_data).execute()
    else:
        # Store in memory
        users_db[user_id] = user
        
        # If teacher, create teacher profile
        if role == "teacher":
            teachers_db[user_id] = Teacher(
                id=user_id,
                name=name,
                email=email,
                phone=kwargs.get("phone") or "",
                grade=kwargs.get("grade") or "",
                subject=kwargs.get("subject") or "",
                location=kwargs.get("location") or "",
                crp_id=kwargs.get("crp_id") or "",
                total_queries=0
            )
    
    return user

def get_teachers_by_crp(crp_id: str) -> List[Teacher]:
    sb = _get_supabase_client()
    if sb:
        resp = sb.table("teachers").select("*").eq("crp_id", crp_id).execute()
        return [Teacher(**t) for t in (resp.data or [])]

    return [t for t in teachers_db.values() if t.crp_id == crp_id]

def get_all_crps() -> List[User]:
    """Get all CRP users for dropdown selection"""
    sb = _get_supabase_client()
    if sb:
        resp = sb.table("users").select("id, name, email").eq("role", "crp").execute()
        return [User(**u, password_hash="", role=UserRole.CRP) for u in (resp.data or [])]
    
    return [u for u in users_db.values() if u.role == UserRole.CRP]

# Chat operations
def save_chat_message(message: ChatMessage):
    sb = _get_supabase_client()
    if sb:
        payload = message.dict()
        payload["timestamp"] = message.timestamp.isoformat()
        sb.table("chat_history").insert(payload).execute()

        # Update teacher stats
        teacher_resp = sb.table("teachers").select("total_queries").eq("id", message.teacher_id).limit(1).execute()
        current_total = 0
        if teacher_resp.data:
            current_total = teacher_resp.data[0].get("total_queries") or 0
        sb.table("teachers").update({
            "total_queries": current_total + 1,
            "last_active": datetime.now().isoformat()
        }).eq("id", message.teacher_id).execute()
        return

    chat_history_db.append(message)
    
    # Update teacher stats
    teacher = teachers_db.get(message.teacher_id)
    if teacher:
        teacher.total_queries += 1
        teacher.last_active = datetime.now()

def get_teacher_chat_history(teacher_id: str, limit: int = 50) -> List[ChatMessage]:
    sb = _get_supabase_client()
    if sb:
        resp = sb.table("chat_history").select("*").eq("teacher_id", teacher_id).order("timestamp", desc=True).limit(limit).execute()
        return [ChatMessage(**row) for row in (resp.data or [])]

    teacher_chats = [msg for msg in chat_history_db if msg.teacher_id == teacher_id]
def get_teacher_sessions(teacher_id: str):
    """Get all chat sessions grouped by session_id"""
    sb = _get_supabase_client()
    
    if sb:
        # Get all messages for this teacher
        resp = sb.table("chat_history").select("*").eq("teacher_id", teacher_id).order("timestamp", desc=False).execute()
        messages = resp.data or []
    else:
        messages = [msg.dict() for msg in chat_history_db if msg.teacher_id == teacher_id]
    
    # Group by session_id
    sessions = {}
    for msg in messages:
        session_id = msg.get("session_id", msg.get("id"))  # fallback to id for old messages
        if session_id not in sessions:
            sessions[session_id] = {
                "session_id": session_id,
                "messages": [],
                "first_query": msg.get("query_text", ""),
                "timestamp": msg.get("timestamp")
            }
        sessions[session_id]["messages"].append(msg)
    
    # Convert to list and sort by most recent
    session_list = list(sessions.values())
    session_list.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return session_list

def get_crp_chat_history(crp_id: str, limit: int = 100) -> List[ChatMessage]:
    sb = _get_supabase_client()
    if sb:
        teachers_resp = sb.table("teachers").select("id").eq("crp_id", crp_id).execute()
        teacher_ids = [t["id"] for t in (teachers_resp.data or [])]
        if not teacher_ids:
            return []
        resp = sb.table("chat_history").select("*").in_("teacher_id", teacher_ids).order("timestamp", desc=True).limit(limit).execute()
        return [ChatMessage(**row) for row in (resp.data or [])]

    # Get all teachers under this CRP
    teacher_ids = [t.id for t in teachers_db.values() if t.crp_id == crp_id]
    
    # Get chats for these teachers
    crp_chats = [msg for msg in chat_history_db if msg.teacher_id in teacher_ids]
    return sorted(crp_chats, key=lambda x: x.timestamp, reverse=True)[:limit]

def get_crp_analytics(crp_id: str) -> CRPAnalytics:
    teachers = get_teachers_by_crp(crp_id)
    teacher_ids = [t.id for t in teachers]

    sb = _get_supabase_client()
    if sb:
        if not teacher_ids:
            return CRPAnalytics(
                crp_id=crp_id,
                total_teachers=0,
                active_teachers_today=0,
                total_queries_today=0,
                top_topics=[],
                sentiment_distribution={},
                language_distribution={}
            )

        chats_resp = sb.table("chat_history").select("*").in_("teacher_id", teacher_ids).execute()
        all_chats = [ChatMessage(**row) for row in (chats_resp.data or [])]
    else:
        all_chats = [msg for msg in chat_history_db if msg.teacher_id in teacher_ids]

    # Get today's chats
    today = datetime.now().date()
    today_chats = [msg for msg in all_chats if msg.timestamp.date() == today]

    # Active teachers today
    active_teacher_ids = set(msg.teacher_id for msg in today_chats)

    # Topic distribution
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
