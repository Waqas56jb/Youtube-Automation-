"""
🎬 Video Caption Generator - FastAPI Backend
Industry-standard FastAPI application with YouTube automation
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import routers
from backend.routers import videos, captions, youtube, utils, video_management
from backend.app.routers import transcript as app_transcript, story as app_story
from fastapi import Request
from backend.app.services.llm import generate_chat_response
from backend.app.services.whisper import get_whisper_model

# Initialize FastAPI app
app = FastAPI(
    title="Video Caption Generator API",
    description="Professional video caption generation with YouTube automation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://localhost:8000",
        "https://youtube-automation-ui.fly.dev",
        "https://youtube-automation.fly.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(videos.router)  # Already has /api/videos prefix
app.include_router(captions.router)  # Already has /api/captions prefix
app.include_router(youtube.router)  # Already has /api/youtube prefix
app.include_router(utils.router)  # Already has /api prefix
app.include_router(video_management.router)  # Already has /video prefix
app.include_router(app_transcript.router, prefix="/api/transcript")
app.include_router(app_story.router, prefix="/api")

# Warm-up: initialize Whisper on startup to avoid first-request lag
@app.on_event("startup")
async def _warm_whisper_model():
    try:
        _ = get_whisper_model()
    except Exception:
        # Do not block app startup; health and /transcript/health will report details
        pass

# Simple chat endpoint at /chat for the frontend
@app.post("/chat")
async def chat(payload: dict):
    message = str(payload.get("message", "")).strip()
    if not message:
        return {"reply": "Please provide a message."}
    # In-scope canned answer for service/capabilities queries
    lower = message.lower()
    if any(k in lower for k in [
        "service", "services", "what can you do", "features", "capabilities", "what do you offer",
        "what you offer", "scope", "what are you", "your product", "platform do"
    ]):
        reply = (
            "This platform automates your YouTube content pipeline end‑to‑end so you ship faster with higher quality.\n\n"
            "• Transcripts (media & docs): Upload audio/video or documents (PDF, DOCX, TXT, SRT/VTT, PPTX, CSV). We auto‑transcribe with Whisper or extract clean text.\n"
            "• Story generation: Convert any transcript or pasted script into polished, platform‑ready stories using Gemini.\n"
            "• Title & caption generation: Create 5–6 word professional titles and universal‑format captions (hook, value, CTA, 10–15 hashtags).\n"
            "• Video tooling: Upload and trim clips, detect existing captions, tidy orphaned files, and preview media in the library.\n"
            "• Scheduling & automation: Group clips by date, save/edit captions, schedule posts, and manage a lightweight calendar to save hours each week.\n"
            "• YouTube upload: One‑time OAuth. Then private uploads with correct title, description, and tags—no repeated verification.\n"
            "• Dashboards & insights: KPI cards, platform breakdowns, funnels, retention cohorts, timelines, and workflow recommendations to boost reach.\n"
            "• In‑app assistant: Focused guidance on setup (env keys), workflows, and troubleshooting—kept strictly within this product’s scope.\n\n"
            "Ask me anything like: ‘generate captions for today’s clips’, ‘turn this transcript into a story’, ‘schedule and upload tonight’, or ‘optimize my titles’. I’ll walk you through it step‑by‑step."
        )
        return {"reply": reply}
    user_hint = str(payload.get("hint", "")).strip()
    default_scope_hint = (
        "You are the assistant for a social media automation app."
        " Stay strictly within this product's features: YouTube upload (OAuth), caption/title generation"
        " with Gemini, transcripts (Whisper or document extraction), story generation, scheduling,"
        " analytics dashboards, troubleshooting environment keys (GEMINI_API_KEY/GOOGLE_API_KEY) and API usage."
        " Provide focused, positive, action-oriented answers with enough detail to be useful (2–6 sentences)."
        " If a query is out of scope (e.g., generic unrelated topics),"
        " respond with: 'This assistant is focused on YouTube automation and app features.'"
    )
    hint = (default_scope_hint + ("\n\nExtra context: " + user_hint if user_hint else ""))
    reply = generate_chat_response(message, hint)
    return {"reply": reply}

# Root endpoint - API info
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Video Caption Generator API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }

# Health check
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Video Caption Generator API is running",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )