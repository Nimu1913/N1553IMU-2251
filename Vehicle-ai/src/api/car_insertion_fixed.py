from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from PIL import Image
import io
import numpy as np
import torch
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator, SamPredictor
from pathlib import Path

app = FastAPI(title="Car Dealership Tool - Fixed")

# Load SAM model
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
    ml_ready = False

@app.get("/")
def root():
    return {"message": "Car Insertion Tool - Fixed Version"}

@app.post("/insert")
async def insert_car(
    car_image: UploadFile = File(...),
    background_image: UploadFile = File(...),
    scale: float = Form(0.7)
):
    """Insert a car into a background - FIXED mask inversion"""
    
    # Load images
    car_contents = await car_image.read()
    bg_contents = await background_image.read()
    
    car_img = Image.open(io.BytesIO(car_contents))
    bg_img = Image.open(io.BytesIO(bg_contents))
    
    # Segment the car
    print("Segmenting car...")
    car_array = np.array(car_img)
    predictor.set_image(car_array)
    masks = mask_generator.generate(car_array)
    
    if not masks:
        return {"error": "No car detected"}
    
    # Get largest mask (the car)
    largest_mask = max(masks, key=lambda x: x['area'])
    car_mask = largest_mask['segmentation']
    
    # FIX: Invert mask if needed (check if mostly background is selected)
    mask_coverage = np.sum(car_mask) / car_mask.size
    if mask_coverage > 0.5:  # If more than 50% is selected, it's probably inverted
        print("Inverting mask...")
        car_mask = ~car_mask  # Invert the mask
    
    # Extract car with correct mask
    car_rgba = car_img.convert("RGBA")
    car_data = np.array(car_rgba)
    car_data[:, :, 3] = car_mask.astype(np.uint8) * 255
    car_extracted = Image.fromarray(car_data, 'RGBA')
    
    # Find bounding box of car
    rows = np.any(car_mask, axis=1)
    cols = np.any(car_mask, axis=0)
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    
    # Crop to car
    car_cropped = car_extracted.crop((cmin, rmin, cmax, rmax))
    
    # Scale car
    new_width = int(car_cropped.width * scale)
    new_height = int(car_cropped.height * scale)
    car_resized = car_cropped.resize((new_width, new_height), Image.LANCZOS)
    
    # Position in background (bottom center)
    bg_rgba = bg_img.convert("RGBA")
    position_x = (bg_rgba.width - car_resized.width) // 2
    position_y = bg_rgba.height - car_resized.height - 50
    
    # Paste car
    bg_rgba.paste(car_resized, (position_x, position_y), car_resized)
    
    # Convert to RGB
    final = bg_rgba.convert("RGB")
    
    # Return result
    img_byte_arr = io.BytesIO()
    final.save(img_byte_arr, format='JPEG', quality=95)
    img_byte_arr.seek(0)
    
    return StreamingResponse(img_byte_arr, media_type="image/jpeg")

@app.post("/test_segment")
async def test_segment(file: UploadFile = File(...)):
    """Test segmentation to see the mask"""
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    image_array = np.array(image)
    
    predictor.set_image(image_array)
    masks = mask_generator.generate(image_array)
    
    if not masks:
        return {"error": "No objects detected"}
    
    largest_mask = max(masks, key=lambda x: x['area'])
    car_mask = largest_mask['segmentation']
    
    # Check if inverted
    mask_coverage = np.sum(car_mask) / car_mask.size
    if mask_coverage > 0.5:
        car_mask = ~car_mask
    
    # Show the mask as red overlay
    result = image.convert("RGBA")
    overlay = Image.new('RGBA', image.size, (255, 0, 0, 128))
    mask_img = Image.fromarray((car_mask * 255).astype(np.uint8))
    result.paste(overlay, (0, 0), mask_img)
    
    result = result.convert("RGB")
    
    img_byte_arr = io.BytesIO()
    result.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    
    return StreamingResponse(img_byte_arr, media_type="image/jpeg")
