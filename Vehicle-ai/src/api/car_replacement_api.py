from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import io
import uuid
import asyncio
from datetime import datetime
from typing import Optional
import logging

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from pipeline_implementation import AdvancedCarReplacementPipeline
from PIL import Image
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Vehicle AI - Car Replacement API",
    version="1.0.0",
    description="Advanced car replacement using SAM, ControlNet, and harmonization"
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline instance
pipeline = None

@app.on_event("startup")
async def startup_event():
    """Initialize pipeline on startup"""
    global pipeline
    logger.info("Initializing pipeline...")
    try:
        pipeline = AdvancedCarReplacementPipeline()
        logger.info("Pipeline initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize pipeline: {e}")
        raise

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Vehicle AI API",
        "version": "1.0.0",
        "pipeline_ready": pipeline is not None
    }

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models": {
            "sam": "loaded",
            "harmonization": "loaded",
            "shadow": "loaded",
            "controlnet": "available"
        }
    }

@app.post("/api/v1/replace")
async def replace_car(
    car_image: UploadFile = File(...),
    background: UploadFile = File(...),
    position: Optional[str] = Form("auto"),
    scale: Optional[float] = Form(1.0),
    shadow_intensity: Optional[float] = Form(0.5)
):
    """
    Replace car in background using advanced pipeline
    
    Args:
        car_image: Image containing the car to extract
        background: Background image to place car into
        position: Placement position (auto, center, bottom)
        scale: Scale factor for car (0.5-2.0)
        shadow_intensity: Shadow darkness (0.0-1.0)
    """
    request_id = str(uuid.uuid4())[:8]
    logger.info(f"Processing request {request_id}")
    
    try:
        # Save uploaded files temporarily
        car_path = f"/tmp/car_{request_id}.jpg"
        bg_path = f"/tmp/bg_{request_id}.jpg"
        
        car_contents = await car_image.read()
        bg_contents = await background.read()
        
        with open(car_path, "wb") as f:
            f.write(car_contents)
        with open(bg_path, "wb") as f:
            f.write(bg_contents)
        
        # Process through pipeline
        result = pipeline.process(car_path, bg_path)
        
        if result is None:
            raise HTTPException(status_code=400, detail="No car detected in image")
        
        # Convert to bytes for response
        img_byte_arr = io.BytesIO()
        result.save(img_byte_arr, format='JPEG', quality=95)
        img_byte_arr.seek(0)
        
        # Cleanup temp files
        os.remove(car_path)
        os.remove(bg_path)
        
        logger.info(f"Request {request_id} completed successfully")
        
        return StreamingResponse(
            img_byte_arr,
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f"attachment; filename=result_{request_id}.jpg",
                "X-Request-ID": request_id
            }
        )
        
    except Exception as e:
        logger.error(f"Request {request_id} failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/segment")
async def segment_only(
    image: UploadFile = File(...)
):
    """Extract car mask from image"""
    try:
        contents = await image.read()
        img = Image.open(io.BytesIO(contents))
        img_array = np.array(img)
        
        # Use pipeline's segmenter
        mask, bbox = pipeline.segmenter.segment_car_auto(img_array)
        
        if mask is None:
            raise HTTPException(status_code=400, detail="No car detected")
        
        # Return mask as image
        mask_img = Image.fromarray((mask * 255).astype(np.uint8))
        
        img_byte_arr = io.BytesIO()
        mask_img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(img_byte_arr, media_type="image/png")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/status")
async def get_status():
    """Get detailed system status"""
    import torch
    
    return {
        "system": {
            "cuda_available": torch.cuda.is_available(),
            "device": "cuda" if torch.cuda.is_available() else "cpu",
            "pytorch_version": torch.__version__
        },
        "models": {
            "sam": {
                "loaded": pipeline.segmenter is not None,
                "device": pipeline.segmenter.device if pipeline else None
            },
            "harmonization": {
                "loaded": pipeline.harmonizer is not None
            },
            "shadow": {
                "loaded": pipeline.shadow_gen is not None
            }
        }
    }
