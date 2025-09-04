import torch
import numpy as np
from typing import Dict, List, Optional, Tuple
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator, SamPredictor
from PIL import Image
import cv2
from ...core.config import config
from ...utils.logger import get_logger

logger = get_logger(__name__)

class SAMModel:
    def __init__(self):
        self.device = config.model.sam_device
        self.model_type = config.model.sam_model_type
        self.model_path = config.get_model_path("sam")
        self.model = None
        self.predictor = None
        self.mask_generator = None

    def load(self):
        try:
            logger.info(f"Loading SAM model from {self.model_path}")
            self.model = sam_model_registry[self.model_type](checkpoint=str(self.model_path))
            self.model.to(device=self.device)
            self.model.eval()
            
            self.predictor = SamPredictor(self.model)
            self.mask_generator = SamAutomaticMaskGenerator(
                model=self.model,
                points_per_side=32,
                pred_iou_thresh=0.95,
                stability_score_thresh=0.92,
                crop_n_layers=1,
                crop_n_points_downscale_factor=2,
                min_mask_region_area=100
            )
            logger.info("SAM model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load SAM model: {e}")
            raise

    def segment_car(self, image: np.ndarray,
                   point_coords: Optional[List[Tuple[int, int]]] = None,
                   box_coords: Optional[Tuple[int, int, int, int]] = None) -> Dict:
        try:
            self.predictor.set_image(image)
            
            if point_coords or box_coords:
                input_points = np.array(point_coords) if point_coords else None
                input_labels = np.ones(len(point_coords)) if point_coords else None
                input_box = np.array(box_coords) if box_coords else None
                
                masks, scores, logits = self.predictor.predict(
                    point_coords=input_points,
                    point_labels=input_labels,
                    box=input_box,
                    multimask_output=True
                )
                
                best_idx = np.argmax(scores)
                best_mask = masks[best_idx]
                
                return {
                    "masks": [best_mask],
                    "scores": [scores[best_idx]],
                    "boxes": [self._mask_to_box(best_mask)]
                }
            else:
                masks = self.mask_generator.generate(image)
                car_masks = self._filter_car_masks(masks, image.shape)
                
                return {
                    "masks": [m["segmentation"] for m in car_masks],
                    "scores": [m["predicted_iou"] for m in car_masks],
                    "boxes": [m["bbox"] for m in car_masks]
                }
                
        except Exception as e:
            logger.error(f"Segmentation failed: {e}")
            raise

    def _filter_car_masks(self, masks: List[Dict], image_shape: Tuple) -> List[Dict]:
        h, w = image_shape[:2]
        car_masks = []
        
        for mask in masks:
            bbox = mask["bbox"]
            x, y, width, height = bbox
            area_ratio = (width * height) / (w * h)
            
            if 0.05 < area_ratio < 0.7:
                aspect_ratio = width / height
                if 0.8 < aspect_ratio < 3.0:
                    if y > h * 0.1:
                        car_masks.append(mask)
        
        car_masks.sort(key=lambda x: x["area"], reverse=True)
        return car_masks[:3]

    def _mask_to_box(self, mask: np.ndarray) -> Tuple[int, int, int, int]:
        y_coords, x_coords = np.where(mask)
        if len(x_coords) > 0 and len(y_coords) > 0:
            return (
                int(x_coords.min()),
                int(y_coords.min()),
                int(x_coords.max()),
                int(y_coords.max())
            )
        return (0, 0, 0, 0)
