# Text-to-PPT Frontend

## Summary
This is the frontend for the Text-to-PPT application, providing a user-friendly interface to generate, track, and download AI-powered PowerPoint presentations. Built with React and Vite, it communicates with the FastAPI backend and supports real-time status polling, user stats, and topic suggestions.

## Features
- Simple topic input and suggestion bubbles
- Real-time status updates via polling
- Download generated PPTX files
- User statistics and daily usage tracking
- Responsive, modern UI with Tailwind CSS

## Installation
1. **Navigate to the frontend directory:**
   ```bash
   cd frontend/project
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and set the backend API URL if needed.

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   # or
   yarn build
   ```

## Walkthrough & Flow
1. User enters a topic or selects a suggestion.
2. Frontend sends a request to `/api/v1/generate` on the backend.
3. Polls `/api/v1/status/{presentation_id}` for progress.
4. When ready, enables download of the PPTX file.
5. Displays user stats and enforces rate limits.

## Project Structure
- `src/` — React components, hooks, and assets
- `public/` — Static files
- `App.jsx` — Main app entry
- `hooks/` — Custom React hooks for API calls
- `components/` — UI components

---
For backend setup, see `../backend/README.md`.
