from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from PIL import Image, ImageFilter
import io

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Vehicle AI API"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/process")
async def process_image(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    processed = image.filter(ImageFilter.FIND_EDGES)
    
    img_byte_arr = io.BytesIO()
    processed.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    
    return StreamingResponse(img_byte_arr, media_type="image/jpeg")
