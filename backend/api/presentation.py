from fastapi import APIRouter, HTTPException
from models.presentation import PresentationRequest
from services.presentation_service import (
    get_presentation_status,
    get_user_stats,
    download_presentation,
    start_presentation_generation
)
from pydantic import BaseModel
from typing import Optional, List
from utils.helpers import check_daily_limit, increment_user_count
import cloudinary
from utils.redis import redis_client
from models.presentation import TopicInput, TopicSuggestion, PresentationRequest, PresentationResponse
from utils.openai import openai_client
import json

router = APIRouter()

class PresentationRequest(BaseModel):
    selected_topic: str
    user_id: str
    preferences: Optional[dict] = None
    client_id: str

class SuggestionRequest(BaseModel):
    topic: str
    industry: Optional[str] = None
    audience: Optional[str] = None
    slide_count: Optional[int] = 10

@router.get("/")
async def root():
    return {"message": "Text-to-PPT API is running"}

@router.post("/suggestions")
async def get_suggestions(request: SuggestionRequest):
    try:
        prompt = f"""Generate 5 professional presentation topics based on: '{request.topic}'
        
        Requirements:
        - Each topic should be specific and engaging
        - Topics should be relevant to the main theme
        - Format each topic as a single line
        - Make topics suitable for a business presentation
        """
        
        if request.industry:
            prompt += f"\nIndustry Context: {request.industry}"
        if request.audience:
            prompt += f"\nTarget Audience: {request.audience}"
            
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional presentation topic generator. Generate clear, specific, and engaging presentation topics."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        suggestions = response.choices[0].message.content.strip().split('\n')
        suggestions = [s.strip() for s in suggestions if s.strip()]
        suggestions = [s.split('.', 1)[1].strip() if '.' in s else s for s in suggestions]
        
        return {"suggestions": suggestions[:5]}
        
    except Exception as e:
        print(f"Error generating suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate suggestions")

@router.post("/generate")
async def generate_presentation(request: PresentationRequest):
   print("request: ", request)
   return await start_presentation_generation(request)

@router.get("/status/{presentation_id}")
async def status(presentation_id: str):
    return await get_presentation_status(presentation_id)

@router.get("/download/{presentation_id}")
async def download_presentation_endpoint(presentation_id: str):
    return await download_presentation(presentation_id)

@router.get("/user/{user_id}/stats")
async def user_stats(user_id: str):
    return await get_user_stats(user_id)

@router.delete("/presentation/{presentation_id}")
async def delete_presentation(presentation_id: str):
    try:
        cloudinary.uploader.destroy(f"presentations/{presentation_id}")
        redis_client.delete(f"presentation:{presentation_id}")
        return {"message": "Presentation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/presentations/{user_id}")
async def get_user_presentations(user_id: str):
    try:
        presentation_keys = redis_client.keys(f"presentation:*:data")
        presentations = []
        
        for key in presentation_keys:
            data = redis_client.get(key)
            if data:
                presentation_data = json.loads(data)
                if presentation_data.get("user_id") == user_id:
                    presentation_id = key.split(":")[1]
                    status = redis_client.get(f"presentation:{presentation_id}:status")
                    if status:
                        presentations.append({
                            "id": presentation_id,
                            "topic": presentation_data.get("topic"),
                            "status": status,
                            "created_at": presentation_data.get("created_at"),
                            "slide_count": presentation_data.get("slide_count")
                        })
        
        presentations.sort(key=lambda x: x["created_at"], reverse=True)
        return presentations
        
    except Exception as e:
        logger.error(f"Error getting user presentations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user presentations")
