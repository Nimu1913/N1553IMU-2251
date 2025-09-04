import numpy as np
from typing import List, Any
import asyncio
from ..utils.logger import get_logger

logger = get_logger(__name__)

class BatchProcessor:
    def __init__(self, batch_size: int = 4):
        self.batch_size = batch_size
        self.queue = asyncio.Queue()
    
    async def add_to_queue(self, item: Any):
        await self.queue.put(item)
    
    async def process_batch(self, process_func):
        batch = []
        while len(batch) < self.batch_size:
            try:
                item = await asyncio.wait_for(self.queue.get(), timeout=1.0)
                batch.append(item)
            except asyncio.TimeoutError:
                break
        
        if batch:
            return await process_func(batch)
        return []
