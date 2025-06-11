import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    REDIS_URL: str = os.getenv("REDIS_URL")
    UNSPLASH_ACCESS_KEY: str = os.getenv("UNSPLASH_ACCESS_KEY")
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET")
    PEXELS_API_KEY: str = os.getenv("PEXELS_API_KEY")
    PIXABAY_API_KEY: str = os.getenv("PIXABAY_API_KEY")
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "5"))
    MAX_PRESENTATIONS_PER_DAY: int = int(os.getenv("MAX_PRESENTATIONS_PER_DAY", "5"))
    
    # Caching
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "3600"))

    # Presentation Defaults
    DEFAULT_SLIDE_COUNT: int = int(os.getenv("DEFAULT_SLIDE_COUNT", "10"))
    MAX_SLIDE_COUNT: int = int(os.getenv("MAX_SLIDE_COUNT", "20"))
    MIN_SLIDE_COUNT: int = int(os.getenv("MIN_SLIDE_COUNT", "5"))
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    DAILY_LIMIT: int = int(os.getenv("DAILY_LIMIT", "5"))
    MAX_PRESENTATIONS_PER_DAY: int = int(os.getenv("MAX_PRESENTATIONS_PER_DAY", "5"))
    # Celery Configuration
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
    
    @classmethod
    def validate(cls) -> Dict[str, Any]:
        """Validate required settings"""
        errors = []
        
        if not cls.OPENAI_API_KEY:
            errors.append("OPENAI_API_KEY is required")
        
        if not cls.REDIS_URL:
            errors.append("REDIS_URL is required")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "settings": {
                "openai_configured": bool(cls.OPENAI_API_KEY),
                "redis_configured": bool(cls.REDIS_URL),
                "unsplash_configured": bool(cls.UNSPLASH_ACCESS_KEY),
            }
        }

settings = Settings()