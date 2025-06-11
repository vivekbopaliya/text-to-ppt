import redis
from config import settings

# singleton Redis instance
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)