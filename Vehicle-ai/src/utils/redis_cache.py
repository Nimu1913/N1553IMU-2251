import redis
import hashlib
import pickle
import json
from typing import Any, Optional
import logging

logger = logging.getLogger(__name__)

class RedisCache:
    """Redis cache for processed images and results"""
    
    def __init__(self, host='localhost', port=6379, db=0, ttl=3600):
        self.client = redis.Redis(host=host, port=port, db=db, decode_responses=False)
        self.ttl = ttl
        
    def generate_key(self, *args) -> str:
        """Generate cache key from arguments"""
        key_str = json.dumps(args, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            data = self.client.get(key)
            if data:
                return pickle.loads(data)
        except Exception as e:
            logger.error(f"Cache get error: {e}")
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache"""
        try:
            data = pickle.dumps(value)
            self.client.setex(key, ttl or self.ttl, data)
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    def exists(self, key: str) -> bool:
        """Check if key exists"""
        return self.client.exists(key)
    
    def delete(self, key: str):
        """Delete key from cache"""
        self.client.delete(key)
