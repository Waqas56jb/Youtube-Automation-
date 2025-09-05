from typing import Optional
import google.generativeai as genai
from fastapi import HTTPException
from typing import Literal
from backend.app.config import settings

_configured = False


def _ensure_configured() -> None:
    global _configured
    if _configured:
        return
    api_key: Optional[str] = settings.gemini_api_key or settings.google_api_key
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set")
    genai.configure(api_key=api_key)
    _configured = True


def generate_story_with_gemini(
    transcript: str,
    story_format: Optional[Literal["lucy", "narrative", "business", "motivational"]] = None,
    use_custom_prompt: Optional[bool] = None,
    custom_prompt: Optional[str] = None,
) -> str:
    _ensure_configured()
    model = genai.GenerativeModel(settings.gemini_model)
    framing, story = _extract_framing_and_story(transcript)
    prompt = _build_prompt(framing, story, story_format, use_custom_prompt, custom_prompt)
    resp = model.generate_content(prompt)
    text = getattr(resp, "text", None)
    if not text:
        # SDK may return candidates structure; try to extract
        try:
            text = resp.candidates[0].content.parts[0].text  # type: ignore
        except Exception:
            raise HTTPException(status_code=502, detail="Gemini response was empty")
    return _clean_output(text)


def generate_chat_response(message: str, system_hint: Optional[str] = None) -> str:
    """General-purpose chat completion via Gemini."""
    _ensure_configured()
    model = genai.GenerativeModel(settings.gemini_model)
    prompt = message if not system_hint else f"System: {system_hint}\n\nUser: {message}"
    resp = model.generate_content(prompt)
    text = getattr(resp, "text", None)
    if not text:
        try:
            text = resp.candidates[0].content.parts[0].text  # type: ignore
        except Exception:
            raise HTTPException(status_code=502, detail="Gemini chat response empty")
    return _clean_output(text)


def _extract_framing_and_story(transcript: str) -> tuple[str, str]:
    parts = transcript.split('.')
    if len(parts) > 1:
        framing = parts[0].strip() + '.'
        story = '.'.join(parts[1:]).strip()
    else:
        framing = "Personal growth and reflection"
        story = transcript
    return framing, story


def _clean_output(story: str) -> str:
    import re as _re
    cleaned = story.strip()
    cleaned = _re.sub(r"#+\s*\*\*(.*?)\*\*", r"\1", cleaned)
    cleaned = _re.sub(r"\*\*(.*?)\*\*", r"\1", cleaned)
    cleaned = _re.sub(r">\s*\"(.*?)\"", r"\"\1\"", cleaned)
    cleaned = _re.sub(r">\s*(.*?)(?=\n|$)", r"\1", cleaned)
    cleaned = _re.sub(r"CUT \d+\s*\n", "", cleaned)
    cleaned = _re.sub(r"\n{5,}", "\n\n\n\n", cleaned)
    cleaned = _re.sub(r"([.!?])\s*([A-Z])", r"\1 \2", cleaned)
    cleaned = _re.sub(r"^\s*[-*]\s*", "", cleaned, flags=_re.MULTILINE)
    cleaned = _re.sub(r"^\s*>\s*", "", cleaned, flags=_re.MULTILINE)
    cleaned = _re.sub(r"^\s*#+\s*", "", cleaned, flags=_re.MULTILINE)
    return cleaned


def _build_prompt(
    framing: str,
    story: str,
    story_format: Optional[str],
    use_custom_prompt: Optional[bool],
    custom_prompt: Optional[str],
) -> str:
    if use_custom_prompt and (custom_prompt or "").strip():
        return f"""
{custom_prompt}

Input Content:
{framing}
{story}

Please generate a story based on the above custom prompt and input content.
"""

    fmt = (story_format or "lucy").lower()
    if fmt == "narrative":
        return f"""
You are a creative storytelling assistant creating engaging narrative stories.

Input:
- Framing: "{framing}"
- Story: "{story}"

Task: Create a compelling narrative story with proper structure and formatting.

The Midnight Garden

Chapter 1: The Discovery

Write four chapters with descriptive titles, rich language, and proper paragraph breaks. No markdown symbols.
"""
    if fmt == "business":
        return f"""
You are a professional business content creator specializing in case studies and business storytelling.

Input:
- Framing: "{framing}"
- Story: "{story}"

Task: Create a professional business case study with clear structure and actionable insights. Include Executive Summary, The Challenge, The Solution, The Results, Key Learnings, Conclusion. No markdown symbols.
"""
    if fmt == "motivational":
        return f"""
You are a motivational speaker creating inspiring, action-oriented content.

Input:
- Framing: "{framing}"
- Story: "{story}"

Task: Create a powerful motivational speech with opening hook, transformation, formula, breakthrough, and call to action. Clean formatting, no markdown symbols.
"""
    # default lucy format
    return f"""
You are a professional story design assistant creating a voiceover script for Lucy from "Lucy & The Wealth Machine."

Input:
- Framing: "{framing}"
- Story: "{story}"

Task: Create a professional 4-part voiceover script with clean formatting and proper line breaks. Structure: Title, Core Lessons (bullets), 4 segments with 🎬 titles each having 3 quoted hooks, main content, and a closing question; Final call-to-action. No markdown symbols.
"""


def generate_caption_and_title(filename: str, transcript: Optional[str] = None, seed: Optional[int] = None) -> dict:
    _ensure_configured()
    model = genai.GenerativeModel(settings.gemini_model)
    context_keywords = _extract_keywords_from_filename(filename)
    prompt = f"""
You are a social media content assistant.

Produce output in EXACTLY this unlabeled layout (no JSON, no labels, no bullets):
1) First line: a 5-6 word professional Title only.
2) Blank line.
3) One-line Hook (grab attention).
4) Blank line.
5) Value section as 2-3 short lines (what viewers gain).
6) Blank line.
7) One-line CTA (like/share/comment/follow).
8) Blank line.
9) A single line of 10-15 space-separated hashtags (each begins with #).

Context from filename: {', '.join(context_keywords) if context_keywords else 'None'}
Transcript (optional): {transcript or 'None provided'}

Rules:
 - Do NOT include any labels like Hook, Value, CTA, Hashtags.
 - No code blocks. Plain text only.
 - No references to filename.
 - Keep concise, impactful, clean.
"""
    resp = model.generate_content(prompt)
    txt = getattr(resp, "text", None)
    if not txt:
        try:
            txt = resp.candidates[0].content.parts[0].text  # type: ignore
        except Exception:
            raise HTTPException(status_code=502, detail="Gemini caption response empty")
    # Parse plain text output per required layout
    lines = [l.rstrip() for l in (txt or "").splitlines()]
    # Title = first non-empty line
    title = next((l.strip() for l in lines if l.strip()), "").strip()
    # Remaining content after title
    try:
        first_idx = next(i for i, l in enumerate(lines) if l.strip())
        remainder = lines[first_idx + 1:]
    except StopIteration:
        remainder = []

    # Determine hashtags line as the last line containing >=5 # tokens
    hashtags_line = ""
    for l in reversed(remainder):
        tokens = [t for t in l.strip().split() if t.startswith('#')]
        if len(tokens) >= 5:
            hashtags_line = l.strip()
            break

    # Build caption by joining remainder without the detected hashtags line
    caption_lines: list[str] = []
    for l in remainder:
        if hashtags_line and l.strip() == hashtags_line:
            continue
        caption_lines.append(l)

    # Trim leading/trailing blank lines in caption
    def _trim_blanks(arr: list[str]) -> list[str]:
        start = 0
        end = len(arr)
        while start < end and not arr[start].strip():
            start += 1
        while end > start and not arr[end - 1].strip():
            end -= 1
        return arr[start:end]

    caption = "\n".join(_trim_blanks(caption_lines)).strip()

    if not title:
        title = "Compelling Video Title"
    if not caption:
        caption = "You’ll learn a powerful idea in seconds.\n\nClear, practical value you can apply today. Real results.\n\nFollow for more like this."
    if not hashtags_line:
        hashtags_line = "#ai #learning #howto #tips #growth #success #motivation #education #tech #innovation"
    return {"title": title, "caption": caption, "hashtags": hashtags_line}


def _extract_keywords_from_filename(name: str) -> list[str]:
    n = name.lower()
    buckets = {
        "tutorial": ["tutorial","howto","guide","learn","education","teaching"],
        "story": ["story","narrative","journey","experience"],
        "funny": ["funny","humor","comedy","laugh","joke","hilarious"],
        "inspiration": ["inspiration","motivation","success","achievement","goal"],
        "review": ["review","analysis","opinion","thoughts","feedback"],
        "tech": ["tech","technology","gadget","app","software"],
        "business": ["business","entrepreneur","startup","money"],
        "fitness": ["fitness","workout","exercise","health","training"],
    }
    out: list[str] = []
    for label, kws in buckets.items():
        if any(k in n for k in kws):
            out.append(label)
    return out[:5]


