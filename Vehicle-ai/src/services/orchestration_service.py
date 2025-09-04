import asyncio
from typing import Dict, Any
from ..pipeline.workflow import CarReplacementPipeline
from ..utils.logger import get_logger

logger = get_logger(__name__)

class OrchestrationService:
    def __init__(self):
        self.pipeline = CarReplacementPipeline()
    
    async def orchestrate(self, request: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.pipeline.process(request)
        return result

if __name__ == "__main__":
    service = OrchestrationService()
    asyncio.run(service.orchestrate({}))
