from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
from PIL import Image
import io
from ...pipeline.workflow import PipelineRequest
from ...utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

@router.post("/process")
async def process_image(
    background: UploadFile = File(...),
    prompt: str = Form(...),
    quality_level: str = Form("high")
):
    try:
        image_data = await background.read()
        background_image = Image.open(io.BytesIO(image_data))
        
        request = PipelineRequest(
            background_image=background_image,
            car_prompt=prompt,
            quality_level=quality_level
        )
        
        from ...pipeline.workflow import CarReplacementPipeline
        pipeline = CarReplacementPipeline()
        result = await pipeline.process(request)
        
        if result.success:
            img_byte_arr = io.BytesIO()
            result.final_image.save(img_byte_arr, format='JPEG')
            img_byte_arr.seek(0)
            return StreamingResponse(img_byte_arr, media_type="image/jpeg")
        else:
            raise HTTPException(status_code=500, detail=result.error_message)
            
    except Exception as e:
        logger.error(f"Processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
