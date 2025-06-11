# Business logic for presentation generation, suggestions, and file ops

import os
from fastapi.responses import FileResponse
import redis
import json
import uuid
from fastapi import HTTPException, Request, logger
from utils.helpers import check_daily_limit, get_user_key
from config import settings
from models.presentation import TopicInput, TopicSuggestion, PresentationRequest, PresentationResponse
from tasks.presentation_tasks import generate_presentation_task
from utils.openai import openai_client
from utils.redis import redis_client
import requests
import tempfile

async def get_topic_suggestions(topic_input: TopicInput, request: Request):
    """Get topic suggestions based on user input"""
    try:
        suggestions = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates topic suggestions based on user input."},
                {"role": "user", "content": f"Generate topic suggestions for the following topic: {topic_input.topic} in the industry: {topic_input.industry}"}
            ]
        )
        return TopicSuggestion(suggestions=suggestions)
    except Exception as e:
        logger.error(f"Error getting suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate suggestions")

async def download_presentation(presentation_id: str):
    """Download generated presentation"""
    try:
        # Check if presentation exists and is completed
        status = redis_client.get(f"presentation:{presentation_id}:status")
        if status != "completed":
            raise HTTPException(status_code=404, detail="Presentation not ready or not found")
        
        # Get presentation URL from Redis
        download_url = redis_client.get(f"presentation:{presentation_id}")
        if not download_url:
            raise HTTPException(status_code=404, detail="Presentation URL not found")
        
        # Download the file from Cloudinary
        response = requests.get(download_url, stream=True)
        if not response.ok:
            raise HTTPException(status_code=404, detail="Failed to download presentation from storage")
        
        # Create a temporary file to store the PPTX
        with tempfile.NamedTemporaryFile(suffix='.pptx', delete=False) as temp_file:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    temp_file.write(chunk)
            temp_file.flush()
            
            return FileResponse(
                temp_file.name,
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                filename=f"presentation_{presentation_id}.pptx",
                background=None
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading presentation: {e}")
        raise HTTPException(status_code=500, detail="Failed to download presentation")

async def start_presentation_generation(
    request_data: PresentationRequest, 
):
    """Generate a presentation asynchronously"""
    try:
   
        
        presentation_id = str(uuid.uuid4())
        
        task = generate_presentation_task.delay(
            presentation_id,
            request_data.selected_topic,
            request_data.preferences.get("slide_count", 10),
            request_data.user_id,
            request_data.client_id
        )
        
        redis_client.setex(f"presentation:{presentation_id}:status", 3600, "queued")
        redis_client.setex(f"presentation:{presentation_id}:task_id", 3600, task.id)
        
        return PresentationResponse(
            presentation_id=presentation_id,
            status="queued"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating presentation: {e}")
        raise HTTPException(status_code=500, detail="Failed to start presentation generation")

async def get_presentation_status(presentation_id: str):
    """Get presentation generation status"""
    try:
        status = redis_client.get(f"presentation:{presentation_id}:status")
        if not status:
            raise HTTPException(status_code=404, detail="Presentation not found")
        
        response = {"presentation_id": presentation_id, "status": status}
        
        if status == "completed":
            data = redis_client.get(f"presentation:{presentation_id}:data")
            if data:
                presentation_data = json.loads(data)
                response.update({
                    "download_url": f"/api/v1/download/{presentation_id}",
                    "created_at": presentation_data["created_at"],
                    "slide_count": presentation_data["slide_count"],
                    "topic": presentation_data["topic"]
                })
        elif status == "failed":
            error = redis_client.get(f"presentation:{presentation_id}:error")
            if error:
                response["error"] = error
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get presentation status")


async def get_user_stats(user_id: str):
    """Get user usage statistics"""
    try:
        daily_count = redis_client.get(get_user_key(user_id)) or 0
        return {
            "user_id": user_id,
            "presentations_today": int(daily_count),
            "daily_limit": settings.MAX_PRESENTATIONS_PER_DAY,
            "remaining": settings.MAX_PRESENTATIONS_PER_DAY - int(daily_count)
        }
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user statistics")

async def get_user_stats(user_id: str):
    """Get user usage statistics"""
    try:
        daily_count = redis_client.get(get_user_key(user_id)) or 0
        return {
            "user_id": user_id,
            "presentations_today": int(daily_count),
            "daily_limit": settings.MAX_PRESENTATIONS_PER_DAY,
            "remaining": settings.MAX_PRESENTATIONS_PER_DAY - int(daily_count)
        }
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user statistics")

