import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Optional

def resize_image(image: np.ndarray, max_size: int) -> Tuple[np.ndarray, float]:
    h, w = image.shape[:2]
    if max(h, w) > max_size:
        scale = max_size / max(h, w)
        new_w = int(w * scale)
        new_h = int(h * scale)
        resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        return resized, scale
    return image, 1.0

def apply_mask(image: np.ndarray, mask: np.ndarray, alpha: float = 1.0) -> np.ndarray:
    mask = mask.astype(np.float32) / 255.0
    mask = cv2.cvtColor(mask, cv2.COLOR_GRAY2BGR) if len(mask.shape) == 2 else mask
    return (image * mask * alpha).astype(np.uint8)

def blend_images(foreground: np.ndarray, background: np.ndarray, 
                mask: np.ndarray) -> np.ndarray:
    mask = mask.astype(np.float32) / 255.0
    if len(mask.shape) == 2:
        mask = np.expand_dims(mask, axis=-1)
    return (foreground * mask + background * (1 - mask)).astype(np.uint8)

def enhance_image(image: np.ndarray, brightness: float = 1.0, 
                 contrast: float = 1.0) -> np.ndarray:
    adjusted = cv2.convertScaleAbs(image, alpha=contrast, beta=brightness * 10)
    return adjusted
