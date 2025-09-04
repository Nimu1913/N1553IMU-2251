from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from PIL import Image, ImageDraw
import io
import numpy as np
import torch
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
from pathlib import Path

app = FastAPI(title="Vehicle AI with ML")

print("Loading SAM model... This will take a minute...")
device = "cpu"  # Mac doesn't have CUDA
sam_path = Path("/app/models/weights/sam/sam_vit_h_4b8939.pth")

if sam_path.exists():
    sam = sam_model_registry["vit_h"](checkpoint=str(sam_path))
    sam.to(device=device)
    mask_generator = SamAutomaticMaskGenerator(
        model=sam,
        points_per_side=8,  # Very low for faster processing
        pred_iou_thresh=0.9,
        stability_score_thresh=0.92
    )
    print("SAM model loaded!")
    ml_ready = True
else:
    print(f"SAM model not found at {sam_path}")
    ml_ready = False
    mask_generator = None

@app.get("/")
def root():
    return {"message": "ML API", "ml_ready": ml_ready}

@app.get("/health")
def health():
    return {"status": "healthy", "ml_loaded": ml_ready}

@app.post("/segment")
async def segment_car(file: UploadFile = File(...)):
    if not ml_ready:
        return {"error": "ML models not loaded"}
    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    image_array = np.array(image)
    
    print(f"Generating masks for {file.filename}... This will be slow...")
    masks = mask_generator.generate(image_array)
    
    if masks:
        # Draw all masks on image
        result = image.copy()
        draw = ImageDraw.Draw(result, 'RGBA')
        
        for mask in masks[:3]:  # Top 3 masks
            m = mask['segmentation']
            overlay = Image.new('RGBA', image.size, (255, 0, 0, 50))
            mask_img = Image.fromarray((m * 255).astype(np.uint8))
            result.paste(overlay, (0, 0), mask_img)
        
        img_byte_arr = io.BytesIO()
        result.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(img_byte_arr, media_type="image/jpeg")
    
    return {"message": "No masks found"}
