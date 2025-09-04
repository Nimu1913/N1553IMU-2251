from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from PIL import Image, ImageDraw
import io
import numpy as np
import torch
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator, SamPredictor
from pathlib import Path

app = FastAPI(title="Car Dealership Tool")

# Load SAM model once at startup
print("Loading SAM model...")
device = "cpu"
sam_path = Path("/app/models/weights/sam/sam_vit_h_4b8939.pth")

if sam_path.exists():
    sam = sam_model_registry["vit_h"](checkpoint=str(sam_path))
    sam.to(device=device)
    predictor = SamPredictor(sam)
    mask_generator = SamAutomaticMaskGenerator(
        model=sam,
        points_per_side=8,
        pred_iou_thresh=0.9,
        stability_score_thresh=0.92
    )
    print("SAM model loaded!")
    ml_ready = True
else:
    print(f"SAM model not found")
    ml_ready = False

@app.get("/")
def root():
    return {
        "message": "Car Dealership Background Tool",
        "endpoints": {
            "/insert": "Insert car into dealership background",
            "/segment": "Extract car from image",
            "/backgrounds": "List available backgrounds"
        }
    }

@app.post("/insert")
async def insert_car(
    car_image: UploadFile = File(..., description="Image of the car"),
    background_image: UploadFile = File(..., description="Dealership/showroom background"),
    position_x: int = Form(None, description="X position (auto if not provided)"),
    position_y: int = Form(None, description="Y position (auto if not provided)"),
    scale: float = Form(1.0, description="Scale factor for car size")
):
    """Insert a car into a dealership background"""
    
    # Load images
    car_contents = await car_image.read()
    bg_contents = await background_image.read()
    
    car_img = Image.open(io.BytesIO(car_contents))
    bg_img = Image.open(io.BytesIO(bg_contents))
    
    # Step 1: Segment the car from its original image
    print("Segmenting car...")
    car_array = np.array(car_img)
    
    # Set image and generate masks
    predictor.set_image(car_array)
    masks = mask_generator.generate(car_array)
    
    if not masks:
        return {"error": "No car detected in image"}
    
    # Get the largest mask (usually the car)
    largest_mask = max(masks, key=lambda x: x['area'])
    car_mask = largest_mask['segmentation']
    
    # Step 2: Extract the car using the mask
    car_rgba = car_img.convert("RGBA")
    car_data = np.array(car_rgba)
    
    # Apply mask - make non-car areas transparent
    car_data[:, :, 3] = car_mask.astype(np.uint8) * 255
    car_extracted = Image.fromarray(car_data, 'RGBA')
    
    # Crop to car bounds
    bbox = largest_mask['bbox']
    x, y, w, h = [int(v) for v in bbox]
    car_cropped = car_extracted.crop((x, y, x+w, y+h))
    
    # Step 3: Resize car based on scale
    new_width = int(car_cropped.width * scale)
    new_height = int(car_cropped.height * scale)
    car_resized = car_cropped.resize((new_width, new_height), Image.LANCZOS)
    
    # Step 4: Position car in the background
    bg_rgba = bg_img.convert("RGBA")
    
    # Auto-position if not specified (bottom center)
    if position_x is None:
        position_x = (bg_rgba.width - car_resized.width) // 2
    if position_y is None:
        position_y = bg_rgba.height - car_resized.height - 50  # 50px from bottom
    
    # Step 5: Add shadow effect
    shadow = Image.new('RGBA', car_resized.size, (0, 0, 0, 100))
    shadow_mask = car_resized.split()[3]  # Use alpha channel as shadow shape
    
    # Place shadow (offset down and right)
    bg_rgba.paste(shadow, (position_x + 10, position_y + 10), shadow_mask)
    
    # Step 6: Paste car onto background
    bg_rgba.paste(car_resized, (position_x, position_y), car_resized)
    
    # Convert back to RGB
    final = bg_rgba.convert("RGB")
    
    # Return the composite image
    img_byte_arr = io.BytesIO()
    final.save(img_byte_arr, format='JPEG', quality=95)
    img_byte_arr.seek(0)
    
    return StreamingResponse(
        img_byte_arr,
        media_type="image/jpeg",
        headers={"Content-Disposition": f"attachment; filename=dealership_composite.jpg"}
    )

@app.post("/segment")
async def segment_car(file: UploadFile = File(...)):
    """Extract just the car from an image"""
    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    image_array = np.array(image)
    
    predictor.set_image(image_array)
    masks = mask_generator.generate(image_array)
    
    if not masks:
        return {"error": "No car detected"}
    
    largest_mask = max(masks, key=lambda x: x['area'])
    car_mask = largest_mask['segmentation']
    
    # Create transparent background image with just the car
    rgba = image.convert("RGBA")
    data = np.array(rgba)
    data[:, :, 3] = car_mask.astype(np.uint8) * 255
    
    result = Image.fromarray(data, 'RGBA')
    
    # Save as PNG to preserve transparency
    img_byte_arr = io.BytesIO()
    result.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    return StreamingResponse(
        img_byte_arr,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=car_extracted.png"}
    )
