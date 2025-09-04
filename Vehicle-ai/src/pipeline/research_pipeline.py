import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import numpy as np
from PIL import Image
import logging

from models.segmentation.sam_implementation import SAMSegmenter
from models.generation.controlnet_full import ControlNetFullGenerator
from models.harmonization.dovenet import DoveNetHarmonizer
from models.shadow.sgrnet import SGRNetShadowGenerator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ResearchPipeline:
    """
    Complete pipeline using all research models:
    - SAM for segmentation
    - ControlNet + SD for generation
    - DoveNet for harmonization  
    - SGRNet for shadows
    """
    
    def __init__(self, use_gpu=False):
        logger.info("Initializing Research Pipeline with full models...")
        
        # Initialize all research models
        self.segmenter = SAMSegmenter()
        self.generator = ControlNetFullGenerator(use_gpu=use_gpu)
        self.harmonizer = DoveNetHarmonizer()
        self.shadow_gen = SGRNetShadowGenerator()
        
        logger.info("Research pipeline ready!")
    
    def process(self, 
                background_path,
                car_prompt="luxury sports car, high quality, professional photography",
                car_image_path=None,
                use_controlnet=True):
        """
        Process with research models
        
        Args:
            background_path: Path to background image
            car_prompt: Prompt for ControlNet generation
            car_image_path: Optional existing car to extract
            use_controlnet: Whether to generate new car or use existing
        """
        
        # Load background
        background = Image.open(background_path)
        bg_array = np.array(background)
        
        if use_controlnet and not car_image_path:
            # GENERATE new car with ControlNet
            logger.info("Generating new car with ControlNet...")
            
            # Create mask for where to place car
            h, w = bg_array.shape[:2]
            mask = Image.new('L', (w, h), 0)
            # Mask bottom center area
            mask_array = np.array(mask)
            mask_array[h//2:, w//4:3*w//4] = 255
            mask = Image.fromarray(mask_array)
            
            # Generate car with ControlNet
            result = self.generator.generate_car(
                background=background,
                mask=mask,
                prompt=car_prompt,
                num_inference_steps=50  # High quality
            )
            
            # Extract the generated car region
            generated_array = np.array(result)
            car_mask = (generated_array != bg_array).any(axis=2)
            
        elif car_image_path:
            # EXTRACT existing car
            logger.info(f"Extracting car from {car_image_path}...")
            car_img = Image.open(car_image_path)
            car_array = np.array(car_img)
            
            # Segment with SAM
            car_mask, bbox = self.segmenter.segment_car_auto(car_array)
            
            if car_mask is None:
                logger.error("No car detected!")
                return None
            
            # Extract and position car
            result = self._position_car(car_img, car_mask, bbox, background)
            generated_array = np.array(result)
            
        else:
            logger.error("Need either car_image_path or use_controlnet=True")
            return None
        
        # Add shadow with SGRNet
        logger.info("Generating shadow with SGRNet...")
        with_shadow = self.shadow_gen.generate_shadow(
            result, 
            car_mask if 'car_mask' in locals() else None
        )
        
        # Harmonize with DoveNet
        logger.info("Harmonizing with DoveNet...")
        harmonized = self.harmonizer.harmonize(
            with_shadow,
            background,
            car_mask if 'car_mask' in locals() else np.ones((100,100))
        )
        
        return harmonized
    
    def _position_car(self, car_img, mask, bbox, background):
        """Position extracted car in background"""
        # Similar to existing code but cleaner
        car_rgba = car_img.convert("RGBA")
        car_data = np.array(car_rgba)
        car_data[:, :, 3] = mask.astype(np.uint8) * 255
        car_extracted = Image.fromarray(car_data, 'RGBA')
        
        x, y, w, h = bbox
        car_cropped = car_extracted.crop((x, y, x+w, y+h))
        
        bg_w, bg_h = background.size
        scale = min(bg_w / (w * 2), bg_h / (h * 2))
        new_w = int(w * scale)
        new_h = int(h * scale)
        car_resized = car_cropped.resize((new_w, new_h), Image.LANCZOS)
        
        pos_x = (bg_w - new_w) // 2
        pos_y = bg_h - new_h - 50
        
        result = background.convert('RGBA')
        result.paste(car_resized, (pos_x, pos_y), car_resized)
        
        return result.convert('RGB')
