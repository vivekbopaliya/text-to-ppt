from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any

class TopicInput(BaseModel):
    topic: str
    industry: Optional[str] = "general"
    audience: Optional[str] = "professional"
    slide_count: Optional[int] = 10
    
    @validator('topic')
    def validate_topic(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Topic must be more descriptive (at least 10 characters)')
        return v.strip()

class TopicSuggestion(BaseModel):
    suggestions: List[str]

class PresentationRequest(BaseModel):
    selected_topic: str
    user_id: str
    preferences: Optional[Dict[str, Any]] = {}
    client_id: Optional[str] = None

class SlideContent(BaseModel):
    title: str
    content: List[str]
    slide_type: str
    image_prompt: Optional[str] = None

class PresentationResponse(BaseModel):
    presentation_id: str
    status: str
    download_url: Optional[str] = None
    slides_preview: Optional[List[Dict]] = None
    error: Optional[str] = None
