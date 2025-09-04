import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

class ShadowGenerator:
    """Generate realistic shadows for inserted objects"""
    
    def __init__(self):
        pass
    
    def generate_shadow(self, image, object_mask, light_direction=(0.5, 0.5)):
        """Generate shadow based on object mask"""
        img = np.array(image)
        mask = np.array(object_mask)
        
        h, w = mask.shape
        
        # Create shadow shape by transforming mask
        shadow = np.zeros((h, w), dtype=np.uint8)
        
        # Offset and skew for shadow
        offset_x = int(w * light_direction[0] * 0.1)
        offset_y = int(h * light_direction[1] * 0.1)
        
        # Simple perspective transform for shadow
        pts1 = np.float32([[0, 0], [w, 0], [0, h], [w, h]])
        pts2 = np.float32([
            [offset_x, offset_y],
            [w - offset_x, offset_y],
            [offset_x * 2, h],
            [w - offset_x * 2, h]
        ])
        
        matrix = cv2.getPerspectiveTransform(pts1, pts2)
        shadow = cv2.warpPerspective(mask, matrix, (w, h))
        
        # Blur shadow
        shadow = cv2.GaussianBlur(shadow, (21, 21), 10)
        
        # Apply shadow to image
        shadow_overlay = np.zeros_like(img)
        shadow_overlay[:, :] = [0, 0, 0]  # Black shadow
        
        # Blend shadow with image
        alpha = (shadow / 255.0) * 0.5  # Shadow opacity
        alpha = np.stack([alpha] * 3, axis=-1)
        
        result = img * (1 - alpha) + shadow_overlay * alpha
        
        return Image.fromarray(result.astype(np.uint8))
    
    def add_contact_shadow(self, image, object_bbox):
        """Add contact shadow where object meets ground"""
        img = Image.fromarray(np.array(image))
        
        # Create shadow ellipse
        shadow = Image.new('RGBA', img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(shadow)
        
        x, y, w, h = object_bbox
        shadow_height = h // 8
        
        # Draw ellipse shadow
        draw.ellipse(
            [x, y + h - shadow_height, x + w, y + h + shadow_height],
            fill=(0, 0, 0, 100)
        )
        
        # Blur the shadow
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=10))
        
        # Composite
        img = img.convert('RGBA')
        img = Image.alpha_composite(img, shadow)
        
        return img.convert('RGB')
