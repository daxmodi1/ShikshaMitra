from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Shiksha Mitra AI"
    
    # API Keys & Paths
    GROQ_API_KEY: str
    CHROMA_DB_DIR: str = "./data/chroma_db"

    # Models
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    STT_MODEL: str = "whisper-large-v3-turbo"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Supabase (Postgres)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Twilio WhatsApp Sandbox
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = "whatsapp:+14155238886"  # Twilio Sandbox number

    class Config:
        env_file = ".env"

settings = Settings()