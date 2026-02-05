from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse
from app.config import settings
from app.ai import run_ai_pipeline, add_to_memory, transcribe_audio
from app.database import get_user_by_email, save_chat_message, get_teacher_by_id
from app.models import ChatMessage
from app.auth import verify_password
from typing import Dict
import uuid
from datetime import datetime
import httpx
import io

# Initialize Twilio client
def get_twilio_client():
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        return None
    return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

# Store WhatsApp user sessions
# Key: phone_number, Value: {
#   "session_id": str,
#   "teacher_id": str,
#   "logged_in": bool,
#   "login_state": "none|awaiting_email|awaiting_password",
#   "temp_email": str
# }
whatsapp_sessions: Dict[str, dict] = {}

def get_or_create_session(phone_number: str) -> dict:
    """Get existing session or create new one for WhatsApp user"""
    if phone_number not in whatsapp_sessions:
        whatsapp_sessions[phone_number] = {
            "session_id": str(uuid.uuid4()),
            "teacher_id": None,
            "logged_in": False,
            "login_state": "none",
            "temp_email": None
        }
    return whatsapp_sessions[phone_number]

def clear_whatsapp_session(phone_number: str):
    """Clear conversation for a phone number but keep login info"""
    if phone_number in whatsapp_sessions:
        session = whatsapp_sessions[phone_number]
        session["session_id"] = str(uuid.uuid4())  # New conversation ID
        session["login_state"] = "none"
        session["temp_email"] = None

async def handle_whatsapp_message(from_number: str, message_body: str) -> str:
    """
    Process incoming WhatsApp message and return AI response
    Handles login flow and query processing
    """
    try:
        session = get_or_create_session(from_number)
        logged_in = session["logged_in"]
        teacher_id = session["teacher_id"]
        
        print(f"[WhatsApp] From: {from_number} | Logged in: {logged_in} | Teacher: {teacher_id}")
        
        # HANDLE LOGIN FLOW
        if message_body.lower().strip() == "/login":
            if logged_in:
                return "✅ आप पहले से लॉगिन हैं!\n\nYou're already logged in!"
            session["login_state"] = "awaiting_email"
            return "📧 कृपया अपना ईमेल दर्ज करें:\n\nPlease enter your email:"
        
        # If awaiting email
        if session["login_state"] == "awaiting_email":
            session["temp_email"] = message_body.strip()
            session["login_state"] = "awaiting_password"
            return "🔐 कृपया अपना पासवर्ड दर्ज करें:\n\nPlease enter your password:"
        
        # If awaiting password - authenticate
        if session["login_state"] == "awaiting_password":
            email = session["temp_email"]
            password = message_body.strip()
            
            # Verify teacher credentials
            user = get_user_by_email(email)
            if not user or not verify_password(password, user.password_hash):
                session["login_state"] = "none"
                session["temp_email"] = None
                return "❌ गलत ईमेल या पासवर्ड।\n\nInvalid email or password. Type /login to try again."
            
            # Success! Link WhatsApp to teacher
            session["teacher_id"] = user.id
            session["logged_in"] = True
            session["login_state"] = "none"
            session["temp_email"] = None
            session["session_id"] = str(uuid.uuid4())  # Reset session for logged-in user
            
            print(f"[WhatsApp] ✅ Teacher {user.id} logged in via WhatsApp from {from_number}")
            return f"✅ स्वागत है {user.name}!\n\nWelcome {user.name}! You're now connected. Ask me anything in Hindi or English!"
        
        # HANDLE LOGOUT
        if message_body.lower().strip() == "/logout":
            if not logged_in:
                return "आप लॉगिन नहीं हैं।\n\nYou're not logged in."
            session["teacher_id"] = None
            session["logged_in"] = False
            session["session_id"] = str(uuid.uuid4())
            return "👋 लॉग आउट हो गए। /login से दोबारा लॉगिन करें।\n\nLogged out. Use /login to log back in."
        
        # HANDLE SPECIAL COMMANDS
        if message_body.lower().strip() in ["/start", "/new", "/reset"]:
            clear_whatsapp_session(from_number)
            if not logged_in:
                return "नमस्ते! /login से शुरुआत करें।\n\nHi! Start with /login"
            return "✨ नया चैट शुरू किया गया।\n\nNew conversation started!"
        
        if message_body.lower().strip() == "/help":
            help_msg = """📚 *Shiksha Mitra Commands:*

/login - Login with email & password
/logout - Logout
/start - New conversation  
/reset - Clear chat history
/help - Show this help

या सीधे प्रश्न पूछें:
• कक्षा प्रबंधन
• शिक्षण विधियां
• विषय ज्ञान"""
            if not logged_in:
                help_msg += "\n\n⚠️ पहले /login करें\nPlease /login first"
            return help_msg
        
        # REQUIRE LOGIN FOR QUERIES
        if not logged_in:
            return "🔐 प्रश्न पूछने के लिए पहले लॉगिन करें: /login\n\nPlease login first to ask questions: /login"
        
        # PROCESS QUERY (User is logged in)
        session_id = session["session_id"]
        print(f"[WhatsApp] Processing query from teacher {teacher_id}, session {session_id}")
        
        # Get AI response
        response = await run_ai_pipeline(message_body, session_id)
        print(f"[WhatsApp] AI Response ready")
        
        # SAVE TO DATABASE
        try:
            chat_msg = ChatMessage(
                id=str(uuid.uuid4()),
                session_id=session_id,
                teacher_id=teacher_id,
                query_text=message_body,
                answer_text=response.answer_text,
                detected_topic=response.detected_topic,
                query_sentiment=response.query_sentiment,
                detected_language=response.detected_language,
                source_type="whatsapp"
            )
            save_chat_message(chat_msg)
            print(f"[WhatsApp] Saved to database for teacher {teacher_id}")
        except Exception as db_err:
            print(f"[WhatsApp] DB save error: {db_err}")
        
        return response.answer_text
        
    except Exception as e:
        print(f"[WhatsApp] Error: {e}")
        import traceback
        traceback.print_exc()
        return "क्षमा करें, कुछ त्रुटि हुई। /login से दोबारा शुरू करें।\n\nError occurred. Try /login again."

async def handle_whatsapp_voice(from_number: str, media_url: str, media_type: str) -> str:
    """
    Process incoming WhatsApp voice message
    Downloads audio from Twilio URL, transcribes it, and processes as text query
    """
    try:
        session = get_or_create_session(from_number)
        logged_in = session["logged_in"]
        teacher_id = session["teacher_id"]
        
        print(f"[WhatsApp Voice] From: {from_number} | Logged in: {logged_in}")
        
        # Require login
        if not logged_in:
            return "🔐 प्रश्न पूछने के लिए पहले लॉगिन करें: /login\n\nPlease login first: /login"
        
        # Download audio from Twilio URL
        print(f"[WhatsApp Voice] Downloading from: {media_url}")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Twilio media URLs are pre-signed, no auth needed
                response = await client.get(media_url)
                if response.status_code != 200:
                    print(f"[WhatsApp Voice] Failed to download: {response.status_code}")
                    return "माफ करें, आवाज़ डाउनलोड में समस्या हुई।\n\nError downloading voice message."
                
                audio_bytes = response.content
        except Exception as download_err:
            print(f"[WhatsApp Voice] Download exception: {download_err}")
            return "माफ करें, आवाज़ डाउनलोड में समस्या हुई।\n\nError downloading voice message."
        
        print(f"[WhatsApp Voice] Downloaded {len(audio_bytes)} bytes, Media type: {media_type}")
        
        # Determine file extension from media type
        ext_map = {
            "audio/ogg": "ogg",
            "audio/webm": "webm",
            "audio/wav": "wav",
            "audio/mpeg": "mp3",
            "audio/mp4": "m4a"
        }
        ext = ext_map.get(media_type, "ogg")
        
        # Transcribe audio
        try:
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = f"whatsapp_voice.{ext}"
            transcribed_text = await transcribe_audio(audio_file)
            print(f"[WhatsApp Voice] Transcribed: {transcribed_text}")
        except Exception as trans_err:
            print(f"[WhatsApp Voice] Transcription error: {trans_err}")
            return "माफ करें, आवाज़ समझ नहीं आई।\n\nCould not understand the voice message."
        
        if not transcribed_text or not transcribed_text.strip():
            return "कोई आवाज़ नहीं सुनी गई।\n\nNo audio detected."
        
        # Process transcribed text as query
        session_id = session["session_id"]
        print(f"[WhatsApp Voice] Processing query from teacher {teacher_id}, session {session_id}")
        
        response = await run_ai_pipeline(transcribed_text, session_id)
        print(f"[WhatsApp Voice] AI Response ready")
        
        # Save to database
        try:
            chat_msg = ChatMessage(
                id=str(uuid.uuid4()),
                session_id=session_id,
                teacher_id=teacher_id,
                query_text=transcribed_text,
                answer_text=response.answer_text,
                detected_topic=response.detected_topic,
                query_sentiment=response.query_sentiment,
                detected_language=response.detected_language,
                source_type="whatsapp"
            )
            save_chat_message(chat_msg)
            print(f"[WhatsApp Voice] Saved to database for teacher {teacher_id}")
        except Exception as db_err:
            print(f"[WhatsApp Voice] DB save error: {db_err}")
        
        return response.answer_text
        
    except Exception as e:
        print(f"[WhatsApp Voice] Error: {e}")
        import traceback
        traceback.print_exc()
        return "क्षमा करें, कुछ त्रुटि हुई।\n\nError processing voice message."

def send_whatsapp_message(to_number: str, message: str) -> bool:
    """
    Send outbound WhatsApp message (for notifications/alerts)
    
    Args:
        to_number: Recipient WhatsApp number (format: whatsapp:+1234567890)
        message: Message text to send
        
    Returns:
        True if sent successfully, False otherwise
    """
    client = get_twilio_client()
    if not client:
        print("Twilio client not configured")
        return False
    
    try:
        message = client.messages.create(
            from_=settings.TWILIO_WHATSAPP_NUMBER,
            to=to_number,
            body=message
        )
        print(f"WhatsApp message sent: {message.sid}")
        return True
    except Exception as e:
        print(f"Failed to send WhatsApp message: {e}")
        return False
