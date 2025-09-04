from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from PIL import Image
import numpy as np
import io

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Car Insertion API - Simple Version"}

@app.post("/insert")
async def insert_car(
    car_image: UploadFile = File(...),
    background_image: UploadFile = File(...),
    scale: float = 0.6
):
    """Simple car insertion without ML"""
    
    # Load images
    car_contents = await car_image.read()
    bg_contents = await background_image.read()
    
    car_img = Image.open(io.BytesIO(car_contents))
    bg_img = Image.open(io.BytesIO(bg_contents))
    
    # Simple approach: Assume white/light background for car
    car_array = np.array(car_img)
    
    # Create mask based on non-white pixels (simple threshold)
    # Assuming car photos have white/light backgrounds
    gray = np.dot(car_array[...,:3], [0.299, 0.587, 0.114])
    mask = gray < 240  # Non-white pixels
    
    # Clean up mask
    from scipy import ndimage
    mask = ndimage.binary_erosion(mask, iterations=2)
    mask = ndimage.binary_dilation(mask, iterations=2)
    
    # Extract car
    car_rgba = car_img.convert("RGBA")
    car_data = np.array(car_rgba)
    car_data[:, :, 3] = mask.astype(np.uint8) * 255
    car_extracted = Image.fromarray(car_data, 'RGBA')
    
    # Find bounding box
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    if not np.any(rows) or not np.any(cols):
        # If no car detected, just return background
        img_byte_arr = io.BytesIO()
        bg_img.save(img_byte_arr, format='JPEG', quality=95)
        img_byte_arr.seek(0)
        return StreamingResponse(img_byte_arr, media_type="image/jpeg")
    
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
    position_y = bg_rgba.height - car_resized.height - 100
    
    # Paste car
    bg_rgba.paste(car_resized, (position_x, position_y), car_resized)
    
    # Convert to RGB
    final = bg_rgba.convert("RGB")
    
    # Return result
    img_byte_arr = io.BytesIO()
    final.save(img_byte_arr, format='JPEG', quality=95)
    img_byte_arr.seek(0)
    
    return StreamingResponse(img_byte_arr, media_type="image/jpeg")
