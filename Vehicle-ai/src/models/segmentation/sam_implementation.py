import torch
import numpy as np
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator, SamPredictor
from PIL import Image
import cv2

class SAMSegmenter:
    """Proper SAM implementation for car segmentation"""
    
    def __init__(self, model_path="models/weights/sam/sam_vit_h_4b8939.pth"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        
        # Load SAM model
        self.sam = sam_model_registry["vit_h"](checkpoint=model_path)
        self.sam.to(device=self.device)
        self.sam.eval()
        
        # Initialize mask generator for automatic segmentation
        self.mask_generator = SamAutomaticMaskGenerator(
            model=self.sam,
            points_per_side=32,
            pred_iou_thresh=0.95,
            stability_score_thresh=0.92,
            min_mask_region_area=100
        )
        
        # Initialize predictor for interactive segmentation
        self.predictor = SamPredictor(self.sam)
    
    def segment_car_auto(self, image):
        """Automatically segment the car from the image"""
        # Generate all masks
        masks = self.mask_generator.generate(image)
        
        # Filter for car-like objects
        h, w = image.shape[:2]
        car_candidates = []
        
        for mask in masks:
            bbox = mask["bbox"]
            x, y, width, height = bbox
            area_ratio = (width * height) / (w * h)
            aspect_ratio = width / height
            
            # Cars are typically:
            # - Medium to large (5-70% of image)
            # - Wider than tall (0.8-3.0 aspect ratio)
            # - Not at the very top of image
            if 0.05 < area_ratio < 0.7 and 0.8 < aspect_ratio < 3.0 and y > h * 0.1:
                car_candidates.append(mask)
        
        if car_candidates:
            # Return the largest candidate
            best_mask = max(car_candidates, key=lambda x: x["area"])
            return best_mask["segmentation"], best_mask["bbox"]
        
        return None, None
    
    def segment_car_interactive(self, image, point=None, box=None):
        """Interactive segmentation with point or box prompt"""
        self.predictor.set_image(image)
        
        masks, scores, logits = self.predictor.predict(
            point_coords=np.array([point]) if point else None,
            point_labels=np.array([1]) if point else None,
            box=np.array(box) if box else None,
            multimask_output=True
        )
        
        # Return best mask
        best_idx = np.argmax(scores)
        return masks[best_idx], scores[best_idx]
