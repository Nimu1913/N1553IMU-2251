import torch
from pathlib import Path
from typing import Dict, Any
from ..utils.logger import get_logger

logger = get_logger(__name__)

class ModelLoader:
    @staticmethod
    def load_checkpoint(path: Path, device: str = "cuda") -> Dict[str, Any]:
        logger.info(f"Loading checkpoint from {path}")
        checkpoint = torch.load(path, map_location=device)
        return checkpoint
    
    @staticmethod
    def save_checkpoint(model: torch.nn.Module, path: Path):
        logger.info(f"Saving checkpoint to {path}")
        torch.save(model.state_dict(), path)
