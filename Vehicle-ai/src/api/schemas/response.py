from pydantic import BaseModel
from typing import Dict, Any

class ProcessResponse(BaseModel):
    success: bool
    metrics: Dict[str, float]
    message: str
