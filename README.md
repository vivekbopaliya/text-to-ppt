# Text-to-PPT: AI-Powered Presentation Generator

## Video Demo
[Watch the demo on Google Drive](https://drive.google.com/file/d/1DOYNFvYhHYU5V3J5bt9Y3q-vp00_BSXU/view?usp=sharing)

## Overview
Text-to-PPT is a full-stack application that lets users generate professional PowerPoint presentations from descriptive topics using AI. It features a modern React frontend and a robust FastAPI backend with Celery-powered background processing.

## Monorepo Structure
- `backend/` — FastAPI, Celery, Redis, OpenAI integration
- `frontend/` — React, Vite, Tailwind CSS

## Quick Start
1. **Clone the repository:**
   ```bash
   git clone https://github.com/vivekbopaliya/text-to-ppt
   cd text-to-ppt
   ```
2. **See `backend/README.md` and `frontend/project/README.md` for setup instructions.**

## Features
- AI-generated presentations (OpenAI GPT)
- Downloadable PPTX files
- Topic suggestions
- User stats and rate limiting
- Asynchronous background processing (Celery)
- Modern, responsive UI

## Architecture & Flow
1. User enters a topic in the frontend.
2. Backend enqueues a Celery task to generate the presentation.
3. Status is tracked in Redis; frontend polls for updates.
4. When ready, the user downloads the PPTX file.

---
For detailed API and setup instructions, see the respective `README.md` files in each folder.
