from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse, JSONResponse
from PIL import Image, ImageDraw
import io
import numpy as np
import torch
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Vehicle AI with ML", version="1.0.0")

# Global model variable
sam_model = None
mask_generator = None

def load_models():
    global sam_model, mask_generator
    try:
        logger.info("Loading SAM model...")
        sam_path = Path("models/weights/sam/sam_vit_h_4b8939.pth")
        
        if not sam_path.exists():
            logger.error(f"SAM model not found at {sam_path}")
            return False
            
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {device}")
        
        sam_model = sam_model_registry["vit_h"](checkpoint=str(sam_path))
        sam_model.to(device=device)
        
        # Create automatic mask generator
        mask_generator = SamAutomaticMaskGenerator(
            model=sam_model,
            points_per_side=16,  # Reduced for faster processing
            pred_iou_thresh=0.9,
            stability_score_thresh=0.92,
            min_mask_region_area=100
        )
        
        logger.info("SAM model loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        return False

# Load models on startup
models_loaded = load_models()

@app.get("/")
def root():
    return {
        "message": "Vehicle AI API with ML",
        "models_loaded": models_loaded,
        "endpoints": {
            "segment": "/segment - Segment cars from image",
            "process": "/process - Full car replacement (coming soon)",
            "health": "/health"
        }
    }

@app.get("/health")
def health():
    return {"status": "healthy", "models_loaded": models_loaded}

@app.post("/segment")
async def segment_car(file: UploadFile = File(...)):
    if not models_loaded:
        return JSONResponse(
            status_code=503,
            content={"error": "Models not loaded"}
        )
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image_array = np.array(image)
        
        logger.info(f"Processing image: {file.filename}, size: {image.size}")
        
        # Generate masks (this will be slow on CPU)
        logger.info("Generating masks...")
        masks = mask_generator.generate(image_array)
        
        # Find largest mask (likely the car)
        if masks:
            largest_mask = max(masks, key=lambda x: x['area'])
            
            # Create visualization
            mask_image = Image.fromarray((largest_mask['segmentation'] * 255).astype(np.uint8))
            
            # Overlay mask on original
            overlay = Image.new('RGBA', image.size, (255, 0, 0, 100))
            mask_overlay = Image.composite(overlay, Image.new('RGBA', image.size, (0, 0, 0, 0)), mask_image)
            
            result = Image.alpha_composite(image.convert('RGBA'), mask_overlay)
            
            # Convert back to RGB
            result = result.convert('RGB')
            
            # Return image with mask overlay
            img_byte_arr = io.BytesIO()
            result.save(img_byte_arr, format='JPEG')
            img_byte_arr.seek(0)
            
            return StreamingResponse(
                img_byte_arr,
                media_type="image/jpeg",
                headers={"Content-Disposition": f"attachment; filename=segmented_{file.filename}"}
            )
        else:
            return {"message": "No objects detected", "masks_found": 0}
            
    except Exception as e:
        logger.error(f"Segmentation failed: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
