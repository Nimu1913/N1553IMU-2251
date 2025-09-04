import sys
import os
sys.path.append(os.path.dirname(__file__))

from models.segmentation.sam_implementation import SAMSegmenter
from models.generation.controlnet_implementation import ControlNetGenerator  
from models.harmonization.harmonization_implementation import ImageHarmonizer
from models.shadow.shadow_implementation import ShadowGenerator
from PIL import Image
import numpy as np

class AdvancedCarReplacementPipeline:
    """Complete pipeline using all advanced models"""
    
    def __init__(self):
        print("Initializing Advanced Pipeline...")
        self.segmenter = SAMSegmenter()
        self.generator = None  # ControlNet requires more VRAM
        self.harmonizer = ImageHarmonizer()
        self.shadow_gen = ShadowGenerator()
        print("Pipeline ready!")
    
    def process(self, car_image_path, background_path, car_prompt=None):
        """Process car replacement"""
        
        # Load images
        car_img = Image.open(car_image_path)
        bg_img = Image.open(background_path)
        
        print("Stage 1: Segmenting car...")
        car_array = np.array(car_img)
        mask, bbox = self.segmenter.segment_car_auto(car_array)
        
        if mask is None:
            print("No car detected!")
            return None
        
        print("Stage 2: Extracting car...")
        # Extract car with mask
        car_rgba = car_img.convert("RGBA")
        car_data = np.array(car_rgba)
        car_data[:, :, 3] = mask.astype(np.uint8) * 255
        car_extracted = Image.fromarray(car_data, 'RGBA')
        
        # Crop to bbox
        x, y, w, h = bbox
        car_cropped = car_extracted.crop((x, y, x+w, y+h))
        
        print("Stage 3: Positioning car...")
        # Scale and position
        bg_w, bg_h = bg_img.size
        scale = min(bg_w / (w * 2), bg_h / (h * 2))
        new_w = int(w * scale)
        new_h = int(h * scale)
        car_resized = car_cropped.resize((new_w, new_h), Image.LANCZOS)
        
        # Position at bottom center
        pos_x = (bg_w - new_w) // 2
        pos_y = bg_h - new_h - 50
        
        print("Stage 4: Adding shadow...")
        # Create shadow first
        shadow_bbox = (pos_x, pos_y, new_w, new_h)
        bg_with_shadow = self.shadow_gen.add_contact_shadow(bg_img, shadow_bbox)
        
        print("Stage 5: Compositing...")
        # Paste car
        bg_with_shadow = bg_with_shadow.convert('RGBA')
        bg_with_shadow.paste(car_resized, (pos_x, pos_y), car_resized)
        
        print("Stage 6: Harmonizing...")
        # Create mask for harmonization
        final_mask = np.zeros((bg_h, bg_w))
        car_mask_resized = np.array(car_resized)[:, :, 3] / 255.0
        final_mask[pos_y:pos_y+new_h, pos_x:pos_x+new_w] = car_mask_resized
        
        # Harmonize
        result = self.harmonizer.harmonize(bg_with_shadow, bg_img, final_mask)
        
        print("Complete!")
        return result

# Test the pipeline
if __name__ == "__main__":
    pipeline = AdvancedCarReplacementPipeline()
    result = pipeline.process(
        "test_images/test_car.jpg",
        "test_images/sporty.jpg"
    )
    if result:
        result.save("advanced_result.jpg")
        print("Result saved as advanced_result.jpg")
