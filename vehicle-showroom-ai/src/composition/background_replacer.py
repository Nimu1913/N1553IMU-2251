import cv2
import numpy as np

class BackgroundReplacer:
    def replace_background(self, original_img, mask, background_img):
        try:
            print(f"Original image shape: {original_img.shape}")
            print(f"Mask shape: {mask.shape}")
            print(f"Background image shape: {background_img.shape}")
            
            # Get original image dimensions
            h, w = original_img.shape[:2]
            
            # Resize mask to match original image if needed
            if mask.shape != (h, w):
                mask = cv2.resize(mask, (w, h))
                print(f"Resized mask to: {mask.shape}")
            
            # Ensure mask is single channel
            if len(mask.shape) == 3:
                mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
            
            # Normalize mask to 0-1 range
            mask = mask.astype(np.float32)
            if mask.max() > 1.0:
                mask = mask / 255.0
            
            # Resize background to match original image dimensions
            background_resized = cv2.resize(background_img, (w, h))
            
            # Smooth mask edges
            mask = cv2.GaussianBlur(mask, (5, 5), 0)
            
            # Ensure mask values are in [0, 1] range
            mask = np.clip(mask, 0, 1)
            
            # Convert to 3-channel mask for broadcasting
            mask_3ch = np.stack([mask] * 3, axis=-1)
            
            # Ensure all images are the same type
            original_img = original_img.astype(np.float32)
            background_resized = background_resized.astype(np.float32)
            
            # Blend images
            result = (original_img * mask_3ch + background_resized * (1 - mask_3ch))
            
            # Convert back to uint8
            result = np.clip(result, 0, 255).astype(np.uint8)
            
            print("Background replacement successful!")
            return result
            
        except Exception as e:
            print(f"Error in background replacement: {str(e)}")
            print("Returning original image...")
            return original_img
