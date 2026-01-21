from pydantic import BaseModel
from typing import List, Optional

class AIResponse(BaseModel):
    answer_text: str
    source_documents: List[str] = []
    suggested_actions: List[str] = []
    
    detected_topic: str = "General"
    query_sentiment: str = "Neutral"
    detected_language: str = "Unknown"