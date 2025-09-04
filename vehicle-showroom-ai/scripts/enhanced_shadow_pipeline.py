# enhanced_shadow_pipeline.py - Combining your pipeline with advanced shadow techniques
import subprocess
import cv2
import numpy as np
from PIL import Image
from pathlib import Path

class EnhancedShadowPipeline:
    def __init__(self):
        self.shadow_intensity = 0.4
        self.shadow_softness = 21
    
    def process(self, car_path, background_path, output_path):
        print(f"Processing {car_path}...")
        
        # Remove background
        temp_file = "temp_no_bg.png"
        subprocess.run(["backgroundremover", "-i", str(car_path), "-o", temp_file], 
                      capture_output=True)
        
        # Load images
        car_pil = Image.open(temp_file).convert('RGBA')
        background = cv2.imread(str(background_path))
        original_car = cv2.imread(str(car_path))
        
        # Get alpha mask
        car_rgba = np.array(car_pil)
        alpha = car_rgba[:,:,3]
        
        # Analyze background lighting
        bg_brightness = self.analyze_lighting(background)
        
        # Size and position
        car_h, car_w = original_car.shape[:2]
        bg_h, bg_w = background.shape[:2]
        
        scale = min(bg_w/car_w * 0.6, bg_h/car_h * 0.6)
        new_w = int(car_w * scale)
        new_h = int(car_h * scale)
        
        car_resized = cv2.resize(original_car, (new_w, new_h))
        alpha_resized = cv2.resize(alpha, (new_w, new_h))
        
        x = (bg_w - new_w) // 2
        y = bg_h - new_h - int(bg_h * 0.08)
        
        # Generate adaptive shadow based on background
        shadow_params = self.calculate_shadow_params(background, bg_brightness)
        background = self.create_adaptive_shadow(
            background, alpha_resized, x, y, new_w, new_h, shadow_params
        )
        
        # Add car with proper blending
        background = self.blend_with_shadow(
            background, car_resized, alpha_resized, x, y
        )
        
        cv2.imwrite(str(output_path), background)
        print(f"✅ Saved to {output_path}")
        
        Path(temp_file).unlink()
        return output_path
    
    def analyze_lighting(self, background):
        """Analyze background brightness to determine shadow properties"""
        gray = cv2.cvtColor(background, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        return brightness
    
    def calculate_shadow_params(self, background, brightness):
        """Calculate shadow parameters based on background"""
        params = {
            'opacity': 0.3 if brightness > 150 else 0.5,  # Lighter shadows for bright backgrounds
            'blur': 31 if brightness > 150 else 21,       # Softer shadows for bright scenes
            'offset_y': 10,                               # Shadow offset
            'spread': 1.2,                                # Shadow spread factor
        }
        return params
    
    def create_adaptive_shadow(self, background, mask, x, y, w, h, params):
        """Create shadow that adapts to background lighting"""
        # Create shadow shape from mask
        shadow_h = int(h * 0.2)
        shadow_w = int(w * params['spread'])
        
        # Generate perspective shadow
        shadow = np.zeros((shadow_h, shadow_w), dtype=np.float32)
        
        # Use bottom portion of mask for shadow base
        mask_bottom = mask[-int(h*0.3):, :]
        
        for i in range(shadow_h):
            progress = i / shadow_h
            fade = (1 - progress) ** 2 * params['opacity']
            
            if fade > 0.01:
                # Create spreading effect
                scale = 1.0 + progress * 0.3
                row_w = int(mask_bottom.shape[1] * scale)
                
                if row_w > 0 and row_w <= shadow_w:
                    # Average the bottom rows for shadow shape
                    shadow_row = cv2.resize(
                        mask_bottom.mean(axis=0).reshape(1, -1),
                        (row_w, 1)
                    )[0]
                    
                    # Center the shadow
                    start_col = (shadow_w - row_w) // 2
                    end_col = start_col + row_w
                    
                    if 0 <= start_col and end_col <= shadow_w:
                        shadow[i, start_col:end_col] = shadow_row * fade / 255.0
        
        # Apply Gaussian blur for soft shadows
        shadow = cv2.GaussianBlur(shadow, (params['blur'], params['blur']), 0)
        
        # Position shadow
        shadow_x = x - (shadow_w - w) // 2
        shadow_y = y + h - params['offset_y']
        
        # Ensure within bounds
        shadow_x = max(0, shadow_x)
        shadow_y = max(0, shadow_y)
        shadow_x_end = min(background.shape[1], shadow_x + shadow_w)
        shadow_y_end = min(background.shape[0], shadow_y + shadow_h)
        
        # Apply shadow to background
        if shadow_x_end > shadow_x and shadow_y_end > shadow_y:
            actual_w = shadow_x_end - shadow_x
            actual_h = shadow_y_end - shadow_y
            
            shadow_resized = cv2.resize(shadow[:actual_h, :actual_w], (actual_w, actual_h))
            
            for c in range(3):
                background[shadow_y:shadow_y_end, shadow_x:shadow_x_end, c] = \
                    (background[shadow_y:shadow_y_end, shadow_x:shadow_x_end, c] * 
                     (1 - shadow_resized)).astype(np.uint8)
        
        return background
    
    def blend_with_shadow(self, background, car, alpha, x, y):
        """Blend car with edge softening"""
        # Soften alpha edges slightly
        alpha_soft = cv2.GaussianBlur(alpha, (5, 5), 0)
        
        # Apply car to background
        for c in range(3):
            alpha_norm = alpha_soft / 255.0
            background[y:y+car.shape[0], x:x+car.shape[1], c] = \
                (1 - alpha_norm) * background[y:y+car.shape[0], x:x+car.shape[1], c] + \
                alpha_norm * car[:,:,c]
        
        return background

# Run it
pipeline = EnhancedShadowPipeline()
pipeline.process(
    'data/input/test_car.jpg',
    'data/backgrounds/showroom1.jpg',
    'enhanced_shadow_result.jpg'
)