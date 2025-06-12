import datetime
from hashlib import md5
from json import dumps
from typing import Dict

from fastapi import HTTPException, logger
from .redis import redis_client
from config import settings

def get_cache_key(topic: str, preferences: dict = None) -> str:
    content = f"{topic}_{dumps(preferences or {}, sort_keys=True)}"
    return md5(content.encode()).hexdigest()

def get_user_key(user_id: str) -> str:
    return f"user:{user_id}:daily_count"

def check_daily_limit(user_id: str) -> Dict[str, any]:
    """
    Check if user has exceeded their daily limit for presentations
    Returns dict with limit info and remaining count
    """
    today = datetime.utcnow().strftime('%Y-%m-%d')
    key = f"user:{user_id}:{today}"
    
    # Get current count
    count = int(redis_client.get(key) or 0)
    
    return {
        "count": count,
        "limit": settings.DAILY_LIMIT,
        "remaining": max(0, settings.DAILY_LIMIT - count),
        "exceeded": count >= settings.DAILY_LIMIT
    }


def increment_user_count(user_id: str):
    """Increment user count"""
    try:
        redis_client.incr(get_user_key(user_id))
    except Exception as e:
        logger.error(f"Error incrementing user count: {e}")
        raise HTTPException(status_code=500, detail="Failed to increment user count")