import hashlib
import json
import pickle
from typing import Any, Optional
import redis
from ..core.config import config

class CacheManager:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=config.service.redis_host,
            port=config.service.redis_port,
            db=config.service.redis_db,
            password=config.service.redis_password
        )
    
    def generate_key(self, data: Any) -> str:
        serialized = json.dumps(str(data), sort_keys=True)
        return hashlib.sha256(serialized.encode()).hexdigest()
    
    async def get(self, key: str) -> Optional[Any]:
        try:
            data = self.redis_client.get(key)
            return pickle.loads(data) if data else None
        except:
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        try:
            serialized = pickle.dumps(value)
            self.redis_client.setex(key, ttl, serialized)
            return True
        except:
            return False
