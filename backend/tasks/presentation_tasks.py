import asyncio
import datetime
import json
import logging
from typing import Optional

from celery import shared_task
from utils.redis import redis_client
from utils.helpers import increment_user_count
from services.presentation_generator import create_powerpoint, generate_presentation_content

# Set up proper logging
logger = logging.getLogger(__name__)

@shared_task(name='tasks.presentation_tasks.generate_presentation_task', bind=True, max_retries=3)
def generate_presentation_task(self, presentation_id: str, topic: str, slide_count: int, user_id: str, client_id: Optional[str] = None):
    try:
        # Update status to processing
        redis_client.setex(f"presentation:{presentation_id}:status", 3600, "processing")
        
        # Generate content - Check if the function is async or sync
        # Option 1: If generate_presentation_content is async
        try:
            slides = asyncio.run(generate_presentation_content(topic, slide_count))
        except ValueError:
            # Option 2: If generate_presentation_content is sync (not a coroutine)
            slides = generate_presentation_content(topic, slide_count)
        
        # Create PowerPoint file
        filepath = create_powerpoint(slides, presentation_id, topic)
        
        # Update status to completed
        presentation_data = {
            "status": "completed",
            "filepath": filepath,
            "created_at": datetime.datetime.now().isoformat(),
            "topic": topic,
            "slide_count": len(slides)
        }
        
        redis_client.setex(
            f"presentation:{presentation_id}:data", 
            3600, 
            json.dumps(presentation_data)
        )
        redis_client.setex(f"presentation:{presentation_id}:status", 3600, "completed")
        
        # Increment user count
        increment_user_count(user_id)
        
        return presentation_data
        
    except Exception as e:
        logger.error(f"Error in background task: {e}")
        redis_client.setex(f"presentation:{presentation_id}:status", 3600, "failed")
        redis_client.setex(f"presentation:{presentation_id}:error", 3600, str(e))
        
        raise self.retry(exc=e, countdown=60)