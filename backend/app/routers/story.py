from fastapi import APIRouter, HTTPException
from backend.app.models import StoryRequest
from backend.app.services.llm import generate_story_with_gemini, generate_chat_response


router = APIRouter(tags=["story"])


@router.post("/story/generate")
async def generate_story(req: StoryRequest):
    try:
        story = generate_story_with_gemini(
            transcript=req.text,
            story_format=req.format,
            use_custom_prompt=req.useCustomPrompt,
            custom_prompt=req.customPrompt,
        )
        return {"story": story}
    except HTTPException as e:
        # Graceful fallback when GEMINI_API_KEY/GOOGLE_API_KEY is not configured
        if e.status_code == 500 and "GEMINI_API_KEY" in str(e.detail):
            preview = (req.text or "").strip()
            preview = preview[:300] + ("…" if len(preview) > 300 else "")
            fallback = (
                "Story (dev fallback)\n\n"
                f"Title: Generated from provided transcript\n\n"
                f"Summary: {preview}\n\n"
                "This is a locally generated placeholder. Configure GEMINI_API_KEY or GOOGLE_API_KEY "
                "on the server to enable high‑quality AI stories."
            )
            return {"story": fallback}
        raise


@router.post("/chat")
async def chat(payload: dict):
    message = str(payload.get("message", "")).strip()
    if not message:
        return {"reply": "Please provide a message."}
    hint = str(payload.get("hint", "")).strip() or None
    reply = generate_chat_response(message, hint)
    return {"reply": reply}


