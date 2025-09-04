from abc import ABC, abstractmethod
import torch
from typing import Any, Dict

class BaseModel(ABC):
    @abstractmethod
    def load(self):
        pass
    
    @abstractmethod
    def predict(self, *args, **kwargs) -> Any:
        pass
    
    def to(self, device: str):
        self.device = device
        return self
