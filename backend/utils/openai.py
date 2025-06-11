import openai
from config import settings

# Fix: Use OpenAI() constructor, not Model()
openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)