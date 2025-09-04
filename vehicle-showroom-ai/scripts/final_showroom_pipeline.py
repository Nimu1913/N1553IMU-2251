# final_garage_pipeline.py - Fixed color and realistic shadows
import subprocess
import cv2
import numpy as np
from PIL import Image
from pathlib import Path

class GaragePipeline:
    def process(self, car_path, background_path, output_path):
        print(f"Processing {car_path}...")
        
        # Remove background
        temp_file = "temp_no_bg.png"
        subprocess.run([
            "backgroundremover", 
            "-i", str(car_path), 
            "-o", temp_file,
            "-m", "u2net"
        ], check=True, capture_output=True)
        
        # Load images
        car_pil = Image.open(temp_file).convert('RGBA')
        background = cv2.imread(str(background_path))
        
        # Fix color issue - keep original colors
        original = cv2.imread(str(car_path))
        
        # Get alpha from backgroundremover
        car_rgba = np.array(car_pil)
        alpha = car_rgba[:,:,3]
        
        # Use original image colors with the alpha mask
        car_h, car_w = original.shape[:2]
        bg_h, bg_w = background.shape[:2]
        
        # Scale to realistic size (car should be prominent)
        scale = min(bg_w/car_w * 0.5, bg_h/car_h * 0.5)
        new_w = int(car_w * scale)
        new_h = int(car_h * scale)
        
        car_resized = cv2.resize(original, (new_w, new_h))
        alpha_resized = cv2.resize(alpha, (new_w, new_h))
        
        # Position on ground properly
        x = (bg_w - new_w) // 2
        y = bg_h - new_h - int(bg_h * 0.15)  # 15% from bottom
        
        # Add shadow first
        shadow = self.create_shadow(background, x, y + new_h - 30, new_w, 60)
        
        # Add reflection
        reflection = self.create_reflection(car_resized, alpha_resized)
        
        # Place reflection
        ref_y = y + new_h - 10
        if ref_y + reflection.shape[0] < bg_h:
            for c in range(3):
                ref_alpha = reflection[:,:,3] / 255.0 * 0.3  # 30% opacity
                end_y = min(ref_y + reflection.shape[0], bg_h)
                shadow[ref_y:end_y, x:x+new_w, c] = \
                    (1 - ref_alpha[:end_y-ref_y]) * shadow[ref_y:end_y, x:x+new_w, c] + \
                    ref_alpha[:end_y-ref_y] * reflection[:end_y-ref_y,:,c]
        
        # Place car
        for c in range(3):
            alpha_norm = alpha_resized / 255.0
            shadow[y:y+new_h, x:x+new_w, c] = \
                (1 - alpha_norm) * shadow[y:y+new_h, x:x+new_w, c] + \
                alpha_norm * car_resized[:,:,c]
        
        cv2.imwrite(str(output_path), shadow)
        print(f"✅ Saved to {output_path}")
        
        Path(temp_file).unlink()
        return output_path
    
    def create_shadow(self, bg, x, y, width, height):
        """Create realistic shadow under car"""
        result = bg.copy()
        overlay = bg.copy()
        
        # Elliptical shadow
        center = (x + width//2, y)
        axes = (width//2 - 20, height//3)
        cv2.ellipse(overlay, center, axes, 0, 0, 360, (0, 0, 0), -1)
        
        # Gaussian blur for soft shadow
        overlay = cv2.GaussianBlur(overlay, (51, 51), 20)
        
        # Blend shadow
        alpha = 0.4
        result = cv2.addWeighted(bg, 1-alpha, overlay, alpha, 0)
        
        return result
    
    def create_reflection(self, car, alpha):
        """Create floor reflection"""
        reflection = cv2.flip(car, 0)  # Vertical flip
        ref_alpha = cv2.flip(alpha, 0)
        
        # Fade out reflection
        fade = np.linspace(0.3, 0, reflection.shape[0])
        for i in range(reflection.shape[0]):
            ref_alpha[i] = ref_alpha[i] * fade[i]
        
        # Create RGBA reflection
        ref_rgba = np.zeros((reflection.shape[0], reflection.shape[1], 4), dtype=np.uint8)
        ref_rgba[:,:,:3] = reflection
        ref_rgba[:,:,3] = ref_alpha
        
        return ref_rgba

# Run with garage background
pipeline = GaragePipeline()
pipeline.process(
    'data/input/test_car.jpg',
    'data/backgrounds/garage.jpg',  # Use a garage background
    'garage_result.jpg'
)