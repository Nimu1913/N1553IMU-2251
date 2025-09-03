import cv2
import numpy as np

class AdvancedBackgroundReplacer:
    def replace_background_advanced(self, original_img, mask, background_img):
        try:
            print("🎨 Starting advanced background replacement...")
            
            # Get dimensions
            h, w = original_img.shape[:2]
            bg_h, bg_w = background_img.shape[:2]
            
            # Resize mask to match original
            if mask.shape != (h, w):
                mask = cv2.resize(mask, (w, h))
            
            # Ensure mask is normalized
            if len(mask.shape) == 3:
                mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
            mask = mask.astype(np.float32)
            if mask.max() > 1.0:
                mask = mask / 255.0
                
            # Find car bounding box for better positioning
            car_coords = np.where(mask > 0.1)
            if len(car_coords[0]) > 0:
                y_min, y_max = car_coords[0].min(), car_coords[0].max()
                x_min, x_max = car_coords[1].min(), car_coords[1].max()
                car_height = y_max - y_min
                car_width = x_max - x_min
                
                print(f"🚗 Car dimensions: {car_width}x{car_height}")
                
                # Smart background scaling - make car take up good portion
                scale_factor = min(bg_w / (car_width * 1.5), bg_h / (car_height * 1.8))
                new_w = int(w * scale_factor)
                new_h = int(h * scale_factor)
                
                # Resize original and mask
                original_resized = cv2.resize(original_img, (new_w, new_h))
                mask_resized = cv2.resize(mask, (new_w, new_h))
                
                # Create positioned image on background
                # Position car in lower center area (typical showroom position)
                start_x = (bg_w - new_w) // 2
                start_y = bg_h - new_h - int(bg_h * 0.1)  # 10% from bottom
                
                # Ensure we don't go out of bounds
                start_x = max(0, min(start_x, bg_w - new_w))
                start_y = max(0, min(start_y, bg_h - new_h))
                
                result = background_img.copy()
                
                # Extract the region and blend
                mask_3ch = np.stack([mask_resized] * 3, axis=-1)
                
                # Smooth mask edges for better blending
                mask_resized_smooth = cv2.GaussianBlur(mask_resized, (7, 7), 0)
                mask_3ch_smooth = np.stack([mask_resized_smooth] * 3, axis=-1)
                
                # Blend in the positioned area
                end_y = start_y + new_h
                end_x = start_x + new_w
                
                original_float = original_resized.astype(np.float32)
                bg_region = result[start_y:end_y, start_x:end_x].astype(np.float32)
                
                # Enhanced blending with better edge handling
                blended_region = (original_float * mask_3ch_smooth + 
                                bg_region * (1 - mask_3ch_smooth))
                
                result[start_y:end_y, start_x:end_x] = blended_region.astype(np.uint8)
                
                print(f"✅ Car positioned at: ({start_x}, {start_y})")
                return result
            
        except Exception as e:
            print(f"❌ Error in advanced replacement: {str(e)}")
            return self.basic_replace(original_img, mask, background_img)
    
    def basic_replace(self, original_img, mask, background_img):
        # Fallback to basic replacement
        h, w = original_img.shape[:2]
        background_resized = cv2.resize(background_img, (w, h))
        
        if len(mask.shape) == 3:
            mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
        mask = mask.astype(np.float32) / 255.0
        mask = cv2.GaussianBlur(mask, (5, 5), 0)
        mask_3ch = np.stack([mask] * 3, axis=-1)
        
        result = (original_img.astype(np.float32) * mask_3ch + 
                 background_resized.astype(np.float32) * (1 - mask_3ch))
        return result.astype(np.uint8)
