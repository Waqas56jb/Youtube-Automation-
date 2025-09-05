"""
Video management router for frontend integration
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Dict, List, Any
import os
from pathlib import Path
from datetime import datetime
import json
import shutil

# Gemini caption/title generation
from backend.app.services.llm import generate_caption_and_title

# YouTube upload service
from backend.services.youtube_service import YouTubeService
from backend.models.database import Database

router = APIRouter(prefix="/video", tags=["video-management"])

# Storage directory for clips
STORAGE_DIR = Path("storage")

@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    """Upload a video file"""
    try:
        # Create today's directory
        today = datetime.now().strftime("%Y/%m/%d")
        upload_dir = STORAGE_DIR / today / "original"
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%H%M%S")
        filename = f"{file.filename.split('.')[0]}_{timestamp}.{file.filename.split('.')[-1]}"
        file_path = upload_dir / filename
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        rel = str(file_path.relative_to(STORAGE_DIR)).replace('\\', '/')
        return {
            "success": True,
            "path": rel,
            "source_path": rel,  # frontend expects source_path
            "message": "Video uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.post("/trim")
async def trim_video(request: Request):
    """Trim a video file. Supports batch clips from frontend."""
    try:
        body = await request.json()
        # Frontend batch format
        source_path = body.get("source_path") or body.get("inputPath")
        clips = body.get("clips")
        if not source_path:
            raise HTTPException(status_code=400, detail="source_path is required")
        input_full_path = STORAGE_DIR / source_path
        if not input_full_path.exists():
            raise HTTPException(status_code=404, detail="Input file not found")

        today = datetime.now().strftime("%Y/%m/%d")
        clips_dir = STORAGE_DIR / today / "clips"
        clips_dir.mkdir(parents=True, exist_ok=True)

        outputs: list[str] = []
        if isinstance(clips, list) and clips:
            for idx, c in enumerate(clips, start=1):
                try:
                    s = float(c.get("start", 0))
                    e = float(c.get("end", 0))
                    if not (e > s >= 0):
                        continue
                    output_filename = f"trim_{s:.2f}-{e:.2f}_{datetime.now().strftime('%H%M%S')}_{idx}.mp4"
                    output_path = clips_dir / output_filename
                    # Fast cut using ffmpeg; fall back to re-encode if stream copy fails
                    try:
                        import subprocess, shlex
                        cmd = f"ffmpeg -y -ss {s} -to {e} -i {shlex.quote(str(input_full_path))} -c copy {shlex.quote(str(output_path))}"
                        ret = subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        if ret.returncode != 0 or not output_path.exists():
                            # Fallback re-encode
                            cmd2 = (
                                f"ffmpeg -y -ss {s} -to {e} -i {shlex.quote(str(input_full_path))} "
                                f"-c:v libx264 -preset veryfast -c:a aac -movflags +faststart {shlex.quote(str(output_path))}"
                            )
                            subprocess.run(cmd2, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                    except Exception:
                        # Final fallback: copy original if ffmpeg unavailable
                        shutil.copy2(input_full_path, output_path)
                    outputs.append(str(output_path.relative_to(STORAGE_DIR)).replace('\\', '/'))
                except Exception:
                    continue
            if not outputs:
                raise HTTPException(status_code=400, detail="No valid clips provided")
            return {"success": True, "clips": outputs, "message": "Clips generated"}

        # Single clip fall-back (legacy)
        start_time = float(body.get("startTime", 0))
        end_time = float(body.get("endTime", 0))
        output_name = body.get("outputName", "trimmed")
        if not (end_time > start_time >= 0):
            raise HTTPException(status_code=400, detail="Invalid start/end times")
        output_filename = f"{output_name}_trim_{start_time:.2f}-{end_time:.2f}_{datetime.now().strftime('%H%M%S')}.mp4"
        output_path = clips_dir / output_filename
        shutil.copy2(input_full_path, output_path)
        return {"success": True, "clips": [str(output_path.relative_to(STORAGE_DIR)).replace('\\', '/')], "message": "Clip generated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error trimming video: {str(e)}")

@router.get("/clips-by-date")
async def get_clips_by_date():
    """Get video clips organized by date"""
    try:
        if not STORAGE_DIR.exists():
            return {}
        
        clips_by_date: Dict[str, List[str]] = {}
        
        # Scan storage directory for video files
        for file_path in STORAGE_DIR.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in ['.mp4', '.avi', '.mov', '.mkv']:
                # Get file creation date
                stat = file_path.stat()
                creation_time = datetime.fromtimestamp(stat.st_ctime)
                date_str = creation_time.strftime("%Y-%m-%d")
                
                # Convert to relative path from storage
                relative_path = str(file_path.relative_to(STORAGE_DIR)).replace('\\', '/')
                
                if date_str not in clips_by_date:
                    clips_by_date[date_str] = []
                clips_by_date[date_str].append(relative_path)
        
        return clips_by_date
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scanning clips: {str(e)}")

@router.post("/delete")
async def delete_clip(request: Request):
    """Delete a video clip"""
    try:
        body = await request.json()
        path = body.get("path")
        
        if not path:
            raise HTTPException(status_code=400, detail="Path is required")
        
        # Construct full path
        full_path = STORAGE_DIR / path
        
        # Security check - ensure path is within storage directory
        try:
            full_path.resolve().relative_to(STORAGE_DIR.resolve())
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid path")
        
        if not full_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Delete the file
        full_path.unlink()
        
        return {"success": True, "message": "File deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")

@router.post("/caption")
async def generate_caption(request: Request):
    """Generate caption for a video"""
    try:
        body = await request.json()
        path = body.get("path")
        seed = body.get("seed", 0)
        
        if not path:
            raise HTTPException(status_code=400, detail="Path is required")
        # Use Gemini to generate title/caption/hashtags
        filename = os.path.basename(path)
        data = generate_caption_and_title(filename=filename, transcript=None, seed=seed)
        return {
            "title": data.get("title", ""),
            "caption": data.get("caption", ""),
            "hashtags": data.get("hashtags", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating caption: {str(e)}")

@router.post("/publish-youtube")
async def publish_to_youtube(request: Request):
    """Publish video to YouTube"""
    try:
        body = await request.json()
        path = body.get("path")
        title = body.get("title", "")
        description = body.get("description", "")
        hashtags = body.get("hashtags", "")
        
        if not path:
            raise HTTPException(status_code=400, detail="Path is required")
        
        # Construct full path
        full_path = STORAGE_DIR / path
        
        if not full_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Prepare minimal video_info
        video_info = {
            "title": os.path.splitext(os.path.basename(str(full_path)))[0],
            "topic": "video",
        }
        # Combine description with hashtags
        caption_for_upload = f"{description}\n\n{hashtags}".strip()
        
        # Use actual YouTubeService (OAuth flow via client_sectets.json)
        yt_service = YouTubeService(Database())
        result = yt_service.upload_video(str(full_path), video_info, caption_for_upload)
        if not result.get("success"):
            raise HTTPException(status_code=502, detail=result.get("error", "YouTube upload failed"))
        return {
            "success": True,
            "message": result.get("message", "Uploaded"),
            "video_id": result.get("video_id"),
            "url": result.get("video_url"),
            "title": result.get("title"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error publishing to YouTube: {str(e)}")

@router.get("/media/{path:path}")
async def serve_media(path: str):
    """Serve media files"""
    try:
        # Construct full path
        full_path = STORAGE_DIR / path
        
        # Security check - ensure path is within storage directory
        try:
            full_path.resolve().relative_to(STORAGE_DIR.resolve())
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid path")
        
        if not full_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(full_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving file: {str(e)}")
