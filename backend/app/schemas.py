from pydantic import BaseModel
from typing import List, Optional

class AIResponse(BaseModel):
    answer_text: str
    source_documents: List[str] = []
    suggested_actions: List[str] = []