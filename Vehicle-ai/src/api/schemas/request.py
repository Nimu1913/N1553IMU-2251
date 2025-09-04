from pydantic import BaseModel
from typing import Optional

class ProcessRequest(BaseModel):
    car_prompt: str
    quality_level: str = "high"
    style_prompt: Optional[str] = None
