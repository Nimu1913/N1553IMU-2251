from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "vehicle-ai"}

@router.get("/ready")
async def readiness_check():
    return {"ready": True}
