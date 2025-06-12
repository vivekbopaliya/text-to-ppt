# Text-to-PPT Backend

## Summary
This is the backend for the Text-to-PPT application, an AI-powered service that generates professional PowerPoint presentations from user-provided topics. It uses FastAPI for the API, Celery for background task processing, Redis for caching and rate limiting, and OpenAI for content generation.

## Features
- Generate presentations from descriptive topics using OpenAI GPT models
- Asynchronous background processing with Celery
- Real-time status polling for presentation generation
- Rate limiting and daily usage tracking per user (via Redis)
- Download generated PPTX files
- Topic suggestion endpoint
- User statistics endpoint
- Modular, production-ready Python codebase

## Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/vivekbopaliya/text-to-ppt
   cd text-to-ppt/backend
   ```
2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv env
   source env/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your API keys and Redis/Celery URLs.
   - Required variables:
     - `OPENAI_API_KEY`
     - `REDIS_URL`
     - `UNSPLASH_ACCESS_KEY` (optional, for images)
     - `CELERY_BROKER_URL`
     - `CELERY_RESULT_BACKEND`

5. **Start Redis and Celery:**
   - Make sure Redis is running (locally or via cloud).
   - Start the Celery worker:
     ```bash
     celery -A celery_config.celery_app worker --loglevel=info
     ```

6. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --reload
   ```

## Walkthrough & Flow
1. **User submits a topic** via the frontend.
2. **API endpoint** (`/api/v1/generate`) receives the request and enqueues a Celery background task.
3. **Celery worker** generates the presentation using OpenAI, saves the PPTX file, and updates status in Redis.
4. **Frontend polls** `/api/v1/status/{presentation_id}` to check progress.
5. When complete, **user downloads** the PPTX via `/api/v1/download/{presentation_id}`.
6. **Rate limiting** and **usage stats** are enforced and tracked per user in Redis.

## API Endpoints
- `POST /api/v1/suggestions` — Get topic suggestions
- `POST /api/v1/generate` — Start presentation generation
- `GET /api/v1/status/{presentation_id}` — Check status
- `GET /api/v1/download/{presentation_id}` — Download PPTX
- `GET /api/v1/user/{user_id}/stats` — Get user stats
- `DELETE /api/v1/presentation/{presentation_id}` — Delete a presentation

## Project Structure
- `main.py` — FastAPI app setup
- `api/` — API route handlers
- `services/` — Business logic
- `tasks/` — Celery tasks
- `models/` — Pydantic models
- `utils/` — Helpers and integrations
- `config.py` — Environment/config loader

---
For more details, see code comments and each module's docstrings.
