# src/composition/advanced_replacer.py
import cv2
import numpy as np
from scipy import ndimage

class AdvancedBackgroundReplacer:
    def __init__(self):
        self.shadow_opacity = 0.4
        self.shadow_blur = 21
        self.edge_blur = 5
        
    def replace_background_advanced(self, original_img, mask, background_img):
        """Advanced background replacement with realistic shadows and lighting"""
        print("🎨 Starting advanced background replacement...")
        
        h, w = original_img.shape[:2]
        bg_h, bg_w = background_img.shape[:2]
        
        # Enhance mask quality first
        mask = self.refine_mask_advanced(mask, h, w)
        
        # Find car bounds
        car_coords = np.where(mask > 0.1)
        if len(car_coords[0]) == 0:
            print("❌ No vehicle found in mask!")
            return background_img
            
        y_min, y_max = car_coords[0].min(), car_coords[0].max()
        x_min, x_max = car_coords[1].min(), car_coords[1].max()
        car_height = y_max - y_min
        car_width = x_max - x_min
        
        print(f"📐 Vehicle size: {car_width}x{car_height}")
        
        # Smart scaling - ensure car looks proportional in showroom
        # Target: car should be about 40-50% of showroom height
        target_height_ratio = 0.42
        scale_factor = (bg_h * target_height_ratio) / car_height
        
        # Limit scaling to reasonable range
        scale_factor = np.clip(scale_factor, 0.3, 2.5)
        
        new_w = int(w * scale_factor)
        new_h = int(h * scale_factor)
        
        print(f"📏 Scaling to: {new_w}x{new_h} (factor: {scale_factor:.2f})")
        
        # High-quality resize
        original_resized = cv2.resize(original_img, (new_w, new_h), 
                                     interpolation=cv2.INTER_LANCZOS4)
        mask_resized = cv2.resize(mask, (new_w, new_h), 
                                 interpolation=cv2.INTER_LANCZOS4)
        
        # FIXED POSITIONING - proper ground placement
        # Position car with wheels on the ground
        start_x = int((bg_w - new_w) * 0.5)  # Center horizontally
        
        # Critical: Place car so it sits on the floor, not floating
        # Account for the fact that wheels aren't at the very bottom of the mask
        wheel_offset = int(new_h * 0.02)  # Wheels are ~2% from bottom of car bounds
        ground_position = int(bg_h * 0.95)  # Floor is at 95% of image height
        start_y = ground_position - new_h + wheel_offset
        
        # Ensure within bounds
        start_x = max(0, min(start_x, bg_w - new_w))
        start_y = max(0, min(start_y, bg_h - new_h))
        
        print(f"📍 Position: ({start_x}, {start_y})")
        
        # Step 1: Match lighting and colors
        enhanced_car = self.match_lighting_advanced(original_resized, background_img, mask_resized)
        
        # Step 2: Create result canvas
        result = background_img.copy()
        
        # Step 3: Add realistic ground shadow FIRST
        result = self.create_ground_shadow(result, mask_resized, start_x, start_y, new_w, new_h)
        
        # Step 4: Add contact shadow for grounding
        result = self.add_contact_shadow(result, mask_resized, start_x, start_y, new_w, new_h)
        
        # Step 5: Blend car with advanced edge treatment
        result = self.blend_advanced(result, enhanced_car, mask_resized, start_x, start_y)
        
        # Step 6: Add subtle reflection if floor is reflective
        if self.is_reflective_floor(background_img):
            result = self.add_floor_reflection(result, enhanced_car, mask_resized, 
                                             start_x, start_y, new_w, new_h)
        
        # Step 7: Final color harmony
        result = self.harmonize_colors(result)
        
        print("✅ Advanced replacement complete!")
        return result
    
    def refine_mask_advanced(self, mask, target_h, target_w):
        """Create high-quality mask with smooth edges"""
        # Resize to target dimensions
        if mask.shape != (target_h, target_w):
            mask = cv2.resize(mask, (target_w, target_h), interpolation=cv2.INTER_CUBIC)
        
        # Convert to grayscale if needed
        if len(mask.shape) == 3:
            mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
        
        # Normalize
        mask = mask.astype(np.float32)
        if mask.max() > 1.0:
            mask = mask / 255.0
        
        # Clean up with morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        mask_binary = (mask > 0.25).astype(np.uint8)
        
        # Close small gaps
        mask_cleaned = cv2.morphologyEx(mask_binary, cv2.MORPH_CLOSE, kernel)
        # Remove small noise
        mask_cleaned = cv2.morphologyEx(mask_cleaned, cv2.MORPH_OPEN, kernel)
        
        # Create smooth edges
        dist_transform = cv2.distanceTransform(mask_cleaned, cv2.DIST_L2, 5)
        mask_smooth = np.clip(dist_transform / 5.0, 0, 1)
        
        # Gaussian blur for feathering
        mask_smooth = cv2.GaussianBlur(mask_smooth, (self.edge_blur, self.edge_blur), 0)
        
        return mask_smooth
    
    def match_lighting_advanced(self, car_img, background_img, mask):
        """Match car lighting to showroom environment"""
        # Convert to LAB color space for better color manipulation
        car_lab = cv2.cvtColor(car_img, cv2.COLOR_BGR2LAB).astype(np.float32)
        bg_lab = cv2.cvtColor(background_img, cv2.COLOR_BGR2LAB).astype(np.float32)
        
        # Analyze background brightness
        bg_brightness = np.mean(bg_lab[:, :, 0])
        bg_std = np.std(bg_lab[:, :, 0])
        
        # Analyze car brightness in visible areas only
        car_visible = mask > 0.5
        if np.any(car_visible):
            car_brightness = np.mean(car_lab[car_visible, 0])
            car_std = np.std(car_lab[car_visible, 0])
            
            # Calculate adjustments
            brightness_diff = bg_brightness - car_brightness
            
            # Adjust brightness (L channel)
            # Showrooms are typically bright, so lighten the car
            adjustment = brightness_diff * 0.3  # Don't over-adjust
            car_lab[:, :, 0] = np.clip(car_lab[:, :, 0] + adjustment, 0, 255)
            
            # Increase contrast slightly for showroom look
            contrast_factor = 1.1
            car_lab[:, :, 0] = np.clip((car_lab[:, :, 0] - 128) * contrast_factor + 128, 0, 255)
            
            # Subtle color temperature adjustment
            # Showrooms often have cool white lighting
            car_lab[:, :, 1] = car_lab[:, :, 1] * 0.95  # Slightly reduce green-red
            car_lab[:, :, 2] = car_lab[:, :, 2] * 0.98  # Slightly reduce blue-yellow
        
        # Add subtle highlights for glossy showroom effect
        highlights = self.create_highlights(car_lab[:, :, 0], mask)
        car_lab[:, :, 0] = np.clip(car_lab[:, :, 0] + highlights, 0, 255)
        
        return cv2.cvtColor(car_lab.astype(np.uint8), cv2.COLOR_LAB2BGR)
    
    def create_highlights(self, l_channel, mask):
        """Add realistic highlights to car surface"""
        # Detect edges/contours where highlights would naturally occur
        edges = cv2.Sobel(mask, cv2.CV_64F, 0, 1, ksize=3)
        edges = np.abs(edges)
        edges = cv2.GaussianBlur(edges, (5, 5), 0)
        
        # Create highlight map - stronger at top of car
        h, w = l_channel.shape
        gradient = np.linspace(1, 0, h).reshape(-1, 1)
        highlight_map = edges * gradient * mask * 20
        
        return highlight_map
    
    def create_ground_shadow(self, background, mask, start_x, start_y, car_w, car_h):
        """Create realistic ground shadow"""
        try:
            # Create shadow from car silhouette
            shadow_source = mask.copy()
            
            # Shadow dimensions
            shadow_height = int(car_h * 0.15)  # Shadow extends 15% of car height
            shadow_width = int(car_w * 1.2)    # Shadow is 20% wider than car
            
            # Create shadow canvas
            shadow = np.zeros((shadow_height, shadow_width), dtype=np.float32)
            
            # Use bottom part of car mask as shadow base
            car_bottom = shadow_source[-50:, :]  # Bottom 50 pixels of car
            
            # Create perspective shadow
            for i in range(shadow_height):
                progress = i / shadow_height
                
                # Shadow fades with distance
                opacity = (1 - progress) ** 2 * self.shadow_opacity
                
                # Shadow spreads with distance
                spread = 1.0 + progress * 0.4
                
                if opacity > 0.01:
                    # Sample and scale
                    row_width = int(car_bottom.shape[1] * spread)
                    if row_width > 0 and row_width <= shadow_width:
                        # Resize bottom of car to create spread effect
                        shadow_row = cv2.resize(car_bottom.mean(axis=0).reshape(1, -1), 
                                              (row_width, 1))[0]
                        
                        # Center the shadow row
                        start_col = (shadow_width - row_width) // 2
                        end_col = start_col + row_width
                        
                        if start_col >= 0 and end_col <= shadow_width:
                            shadow[i, start_col:end_col] = shadow_row * opacity
            
            # Blur shadow for soft edges
            shadow = cv2.GaussianBlur(shadow, (self.shadow_blur, self.shadow_blur), 0)
            
            # Position shadow under the car
            shadow_x = start_x - (shadow_width - car_w) // 2
            shadow_y = start_y + car_h - 10  # Slightly overlap with car bottom
            
            # Ensure shadow is within bounds
            shadow_x = max(0, shadow_x)
            shadow_y = max(0, shadow_y)
            shadow_x_end = min(shadow_x + shadow_width, background.shape[1])
            shadow_y_end = min(shadow_y + shadow_height, background.shape[0])
            
            if shadow_x_end > shadow_x and shadow_y_end > shadow_y:
                # Resize shadow to fit
                actual_width = shadow_x_end - shadow_x
                actual_height = shadow_y_end - shadow_y
                shadow_fitted = cv2.resize(shadow[:actual_height, :actual_width], 
                                         (actual_width, actual_height))
                
                # Apply shadow to background
                for c in range(3):
                    bg_region = background[shadow_y:shadow_y_end, 
                                         shadow_x:shadow_x_end, c].astype(np.float32)
                    background[shadow_y:shadow_y_end, 
                             shadow_x:shadow_x_end, c] = (bg_region * (1 - shadow_fitted)).astype(np.uint8)
            
            print("✅ Ground shadow added")
            return background
            
        except Exception as e:
            print(f"⚠️ Shadow creation failed: {e}")
            return background
    
    def add_contact_shadow(self, background, mask, start_x, start_y, car_w, car_h):
        """Add dark contact shadow directly under the car for grounding"""
        try:
            # Create thin, dark line where car meets ground
            contact_height = 5
            contact_shadow = np.ones((contact_height, car_w)) * 0.6  # Dark shadow
            
            # Position at very bottom of car
            contact_y = start_y + car_h - 3
            
            if contact_y + contact_height <= background.shape[0]:
                # Apply contact shadow
                for c in range(3):
                    bg_region = background[contact_y:contact_y + contact_height, 
                                         start_x:start_x + car_w, c].astype(np.float32)
                    background[contact_y:contact_y + contact_height, 
                             start_x:start_x + car_w, c] = (bg_region * (1 - contact_shadow)).astype(np.uint8)
            
            return background
        except:
            return background
    
    def blend_advanced(self, background, car_img, mask, start_x, start_y):
        """Advanced blending with edge refinement"""
        try:
            end_y = start_y + car_img.shape[0]
            end_x = start_x + car_img.shape[1]
            
            if end_y > background.shape[0] or end_x > background.shape[1]:
                print("⚠️ Car doesn't fit in background!")
                return background
            
            # Multi-layer mask for sophisticated blending
            # Smooth the mask edges
            mask_smooth = cv2.GaussianBlur(mask, (7, 7), 0)
            
            # Create edge mask for special treatment
            edges = cv2.Canny((mask * 255).astype(np.uint8), 50, 150)
            edges = cv2.GaussianBlur(edges.astype(np.float32) / 255, (3, 3), 0)
            
            # Prepare for blending
            mask_3ch = np.stack([mask_smooth] * 3, axis=-1)
            edge_3ch = np.stack([edges] * 3, axis=-1)
            
            # Get regions
            car_float = car_img.astype(np.float32)
            bg_region = background[start_y:end_y, start_x:end_x].astype(np.float32)
            
            # Blend with edge softening
            # Main blend
            blended = car_float * mask_3ch + bg_region * (1 - mask_3ch)
            
            # Soften edges by mixing with background
            edge_blend = car_float * 0.7 + bg_region * 0.3
            blended = blended * (1 - edge_3ch) + edge_blend * edge_3ch
            
            # Apply to background
            background[start_y:end_y, start_x:end_x] = np.clip(blended, 0, 255).astype(np.uint8)
            
            print("✅ Advanced blending complete")
            return background
            
        except Exception as e:
            print(f"⚠️ Blending failed: {e}")
            return background
    
    def is_reflective_floor(self, background):
        """Check if the floor appears reflective"""
        # Check bottom 20% of image
        bottom = background[-background.shape[0]//5:, :]
        gray = cv2.cvtColor(bottom, cv2.COLOR_BGR2GRAY)
        
        # Reflective floors are usually bright and uniform
        brightness = np.mean(gray)
        uniformity = 1 - (np.std(gray) / (brightness + 1))
        
        return brightness > 200 and uniformity > 0.7
    
    def add_floor_reflection(self, background, car_img, mask, start_x, start_y, car_w, car_h):
        """Add subtle floor reflection"""
        try:
            # Check if there's space for reflection
            space_below = background.shape[0] - (start_y + car_h)
            if space_below < 50:
                return background
            
            # Create reflection (flipped car)
            reflection = cv2.flip(car_img, 0)
            mask_refl = cv2.flip(mask, 0)
            
            # Make reflection darker and more transparent
            reflection = (reflection.astype(np.float32) * 0.2).astype(np.uint8)
            
            # Fade reflection with distance
            refl_height = min(int(car_h * 0.3), space_below - 10)
            fade = np.linspace(0.3, 0, refl_height)
            
            for i in range(refl_height):
                mask_refl[i, :] *= fade[i]
            
            # Position reflection
            refl_y = start_y + car_h + 2
            
            # Resize reflection to fit
            reflection = reflection[:refl_height, :]
            mask_refl = mask_refl[:refl_height, :]
            
            # Blend reflection
            if refl_y + refl_height <= background.shape[0]:
                mask_3ch = np.stack([mask_refl] * 3, axis=-1)
                bg_region = background[refl_y:refl_y + refl_height, 
                                     start_x:start_x + car_w].astype(np.float32)
                refl_region = reflection.astype(np.float32)
                
                blended = refl_region * mask_3ch + bg_region * (1 - mask_3ch)
                background[refl_y:refl_y + refl_height, 
                         start_x:start_x + car_w] = blended.astype(np.uint8)
                
                print("✅ Floor reflection added")
            
            return background
            
        except Exception as e:
            print(f"⚠️ Reflection failed: {e}")
            return background
    
    def harmonize_colors(self, image):
        """Final color harmonization"""
        # Subtle adjustments for cohesive look
        # Add slight vignette
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        
        Y, X = np.ogrid[:h, :w]
        dist_from_center = np.sqrt((X - center[0])**2 + (Y - center[1])**2)
        max_dist = np.sqrt(center[0]**2 + center[1]**2)
        
        vignette = 1 - (dist_from_center / max_dist) * 0.2
        vignette = np.stack([vignette] * 3, axis=-1)
        
        result = (image.astype(np.float32) * vignette).astype(np.uint8)
        
        # Slight contrast boost
        result = cv2.addWeighted(result, 1.05, result, 0, -5)
        
        return np.clip(result, 0, 255).astype(np.uint8)