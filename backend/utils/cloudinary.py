import os
import cloudinary
import cloudinary.uploader
from typing import Optional
from config import settings
from .redis import redis_client

# Initialize Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

def upload_to_cloudinary(file_path: str, presentation_id: str, topic: str) -> Optional[str]:
    """
    Upload a PPTX file to Cloudinary and return the URL
    """
    try:
        result = cloudinary.uploader.upload(
            file_path,
            resource_type="raw",
            public_id=f"presentations/{topic}",
            overwrite=True
        )
        return result.get('secure_url')
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        return None

def store_presentation_url(presentation_id: str, url: str, expiry_days: int = 7) -> bool:
    """
    Store the presentation URL in Redis with an expiry time
    """
    try:
        redis_client.setex(
            f"presentation:{presentation_id}",
            expiry_days * 24 * 60 * 60,  # Convert days to seconds
            url
        )
        return True
    except Exception as e:
        print(f"Error storing URL in Redis: {e}")
        return False

def get_presentation_url(presentation_id: str) -> Optional[str]:
    """
    Retrieve the presentation URL from Redis
    """
    try:
        return redis_client.get(f"presentation:{presentation_id}")
    except Exception as e:
        print(f"Error retrieving URL from Redis: {e}")
        return None 