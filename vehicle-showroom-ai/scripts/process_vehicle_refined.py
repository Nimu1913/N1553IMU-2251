#!/usr/bin/env python3
import os
import sys
import argparse
import cv2
import numpy as np
from pathlib import Path

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from src.detection.vehicle_segmenter import VehicleSegmenter

class RefinedReplacer:
    def replace_background_refined(self, original_img, mask, background_img):
        print("🔧 Starting REFINED background replacement...")
        
        h, w = original_img.shape[:2]
        bg_h, bg_w = background_img.shape[:2]
        
        # Super high-quality mask processing
        mask = self.create_perfect_mask(mask, h, w)
        
        # Find car and scale intelligently
        car_coords = np.where(mask > 0.05)
        if len(car_coords[0]) == 0:
            return background_img
            
        y_min, y_max = car_coords[0].min(), car_coords[0].max()
        x_min, x_max = car_coords[1].min(), car_coords[1].max()
        car_height = y_max - y_min
        car_width = x_max - x_min
        
        # Perfect scaling for showroom
        scale_factor = min(bg_w / (car_width * 1.25), bg_h / (car_height * 1.4))
        new_w = int(w * scale_factor)
        new_h = int(h * scale_factor)
        
        # High-quality resize
        original_resized = cv2.resize(original_img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        mask_resized = cv2.resize(mask, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        
        # Perfect positioning
        start_x = int((bg_w - new_w) * 0.42)  # Slightly off-center
        start_y = bg_h - new_h - int(bg_h * 0.08)  # Close to floor
        
        start_x = max(0, min(start_x, bg_w - new_w))
        start_y = max(0, min(start_y, bg_h - new_h))
        
        # Step 1: Perfect lighting match
        enhanced_car = self.perfect_lighting_match(original_resized, background_img, mask_resized)
        
        # Step 2: Create result with perfect shadow
        result = background_img.copy()
        result = self.create_perfect_shadow(result, mask_resized, start_x, start_y, new_w, new_h)
        
        # Step 3: Perfect edge blending
        result = self.perfect_blend(result, enhanced_car, mask_resized, start_x, start_y)
        
        print("✨ REFINED replacement complete!")
        return result
    
    def create_perfect_mask(self, mask, target_h, target_w):
        """Create the highest quality mask possible"""
        if mask.shape != (target_h, target_w):
            mask = cv2.resize(mask, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        
        if len(mask.shape) == 3:
            mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
        
        mask = mask.astype(np.float32)
        if mask.max() > 1.0:
            mask = mask / 255.0
        
        # Multi-stage mask refinement
        binary = (mask > 0.25).astype(np.uint8)
        
        # Advanced morphological operations
        kernel1 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
        kernel2 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (4, 4))
        
        # Clean small artifacts
        cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel1)
        filled = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel2)
        
        # Create distance-based gradient mask
        dist_inside = cv2.distanceTransform(filled, cv2.DIST_L2, 5)
        dist_outside = cv2.distanceTransform(1 - filled, cv2.DIST_L2, 5)
        
        # Create smooth gradient transition
        gradient_mask = np.zeros_like(dist_inside)
        
        # Inside area (full opacity)
        gradient_mask[dist_inside > 8] = 1.0
        
        # Transition zone (gradient)
        transition_zone = (dist_inside <= 8) & (filled > 0)
        gradient_mask[transition_zone] = np.clip(dist_inside[transition_zone] / 8.0, 0, 1)
        
        # Outer feather zone
        outer_zone = (dist_outside <= 3) & (filled == 0)
        gradient_mask[outer_zone] = np.clip((3 - dist_outside[outer_zone]) / 3.0 * 0.1, 0, 0.1)
        
        # Final smoothing
        final_mask = cv2.GaussianBlur(gradient_mask, (3, 3), 0)
        
        return final_mask
    
    def perfect_lighting_match(self, car_img, background_img, mask):
        """Perfect lighting and color matching"""
        # Convert to LAB for precise color control
        car_lab = cv2.cvtColor(car_img, cv2.COLOR_BGR2LAB).astype(np.float32)
        bg_lab = cv2.cvtColor(background_img, cv2.COLOR_BGR2LAB).astype(np.float32)
        
        # Analyze showroom lighting
        bg_gray = cv2.cvtColor(background_img, cv2.COLOR_BGR2GRAY)
        bright_areas = bg_gray > 200
        
        if np.any(bright_areas):
            bg_bright_l = np.mean(bg_lab[bright_areas, 0])
        else:
            bg_bright_l = np.mean(bg_lab[:, :, 0])
        
        # Analyze car lighting in main body areas
        car_body_mask = mask > 0.7
        if np.any(car_body_mask):
            car_l_mean = np.mean(car_lab[car_body_mask, 0])
            
            # Subtle brightness adjustment
            brightness_adjust = (bg_bright_l - car_l_mean) * 0.15
            car_lab[:, :, 0] = np.clip(car_lab[:, :, 0] + brightness_adjust, 0, 255)
        
        # Slight contrast enhancement for showroom look
        car_lab[:, :, 0] = np.clip((car_lab[:, :, 0] - 128) * 1.05 + 128, 0, 255)
        
        # Convert back
        enhanced = cv2.cvtColor(car_lab.astype(np.uint8), cv2.COLOR_LAB2BGR)
        
        return enhanced
    
    def create_perfect_shadow(self, background, mask, start_x, start_y, car_w, car_h):
        """Create the most realistic shadow possible"""
        try:
            # Create shadow from car silhouette
            shadow_source = mask.copy()
            
            # Focus on bottom portion for shadow
            shadow_focus_height = int(shadow_source.shape[0] * 0.4)
            shadow_source[:shadow_source.shape[0] - shadow_focus_height, :] *= 0.3
            
            # Create realistic shadow projection
            shadow_height = int(car_h * 0.35)
            shadow_width = int(car_w * 1.1)  # Shadow slightly wider
            
            # Create perspective shadow matrix
            shadow = np.zeros((shadow_height, shadow_width), dtype=np.float32)
            
            for i in range(shadow_height):
                progress = i / shadow_height
                
                # Non-linear fade (more realistic)
                fade = (1 - progress) ** 1.5 * 0.5
                
                # Perspective scaling
                width_scale = 1.0 - progress * 0.2
                blur_amount = int(1 + progress * 3)
                
                if fade > 0.05:
                    # Sample from shadow source
                    source_row_idx = min(int(shadow_source.shape[0] * (0.7 + progress * 0.3)), 
                                        shadow_source.shape[0] - 1)
                    source_row = shadow_source[source_row_idx, :]
                    
                    # Scale and position
                    scaled_width = int(len(source_row) * width_scale)
                    if scaled_width > 0:
                        scaled_row = cv2.resize(source_row.reshape(1, -1), 
                                              (scaled_width, 1))[0]
                        
                        # Center in shadow
                        start_col = (shadow_width - scaled_width) // 2
                        end_col = start_col + scaled_width
                        
                        if start_col >= 0 and end_col <= shadow_width:
                            shadow[i, start_col:end_col] = scaled_row * fade
            
            # Advanced shadow blurring
            shadow = cv2.GaussianBlur(shadow, (11, 11), 0)
            shadow = cv2.medianBlur((shadow * 255).astype(np.uint8), 5).astype(np.float32) / 255
            
            # Position shadow on ground
            shadow_start_x = start_x - (shadow_width - car_w) // 2
            shadow_start_y = start_y + int(car_h * 0.85)
            shadow_end_x = shadow_start_x + shadow_width
            shadow_end_y = shadow_start_y + shadow_height
            
            # Ensure shadow stays in bounds
            shadow_start_x = max(0, shadow_start_x)
            shadow_start_y = max(0, shadow_start_y)
            shadow_end_x = min(background.shape[1], shadow_end_x)
            shadow_end_y = min(background.shape[0], shadow_end_y)
            
            if shadow_end_x > shadow_start_x and shadow_end_y > shadow_start_y:
                # Adjust shadow to fit
                fit_w = shadow_end_x - shadow_start_x
                fit_h = shadow_end_y - shadow_start_y
                shadow_fit = cv2.resize(shadow, (fit_w, fit_h))
                
                # Apply shadow with color preservation
                for c in range(3):
                    bg_region = background[shadow_start_y:shadow_end_y, 
                                         shadow_start_x:shadow_end_x, c].astype(np.float32)
                    # Darken background preserving color tone
                    bg_region *= (1 - shadow_fit * 0.7)
                    background[shadow_start_y:shadow_end_y, 
                             shadow_start_x:shadow_end_x, c] = bg_region
            
            print("✅ Perfect shadow created")
            
        except Exception as e:
            print(f"⚠️ Shadow failed: {e}")
        
        return background
    
    def perfect_blend(self, background, car_img, mask, start_x, start_y):
        """The highest quality blending possible"""
        try:
            end_y = start_y + car_img.shape[0]
            end_x = start_x + car_img.shape[1]
            
            if end_y > background.shape[0] or end_x > background.shape[1]:
                return background
            
            # Multi-layer blending approach
            bg_region = background[start_y:end_y, start_x:end_x].astype(np.float32)
            car_float = car_img.astype(np.float32)
            
            # Create multiple mask layers for different blend strengths
            mask_core = np.clip(mask - 0.3, 0, 1) / 0.7  # Core area
            mask_edge = np.clip((mask - 0.1) * 5, 0, 1)  # Edge area
            mask_outer = np.clip(mask * 10, 0, 1)       # Outer transition
            
            # Blend core area (sharp details)
            core_3ch = np.stack([mask_core] * 3, axis=-1)
            core_blend = car_float * core_3ch + bg_region * (1 - core_3ch)
            
            # Blend edge area (smooth transition)
            edge_smooth = cv2.GaussianBlur(mask_edge, (5, 5), 0)
            edge_3ch = np.stack([edge_smooth] * 3, axis=-1)
            edge_blend = core_blend * edge_3ch + bg_region * (1 - edge_3ch)
            
            # Final outer blend (very smooth)
            outer_smooth = cv2.GaussianBlur(mask_outer, (9, 9), 0)
            outer_3ch = np.stack([outer_smooth] * 3, axis=-1)
            final_blend = edge_blend * outer_3ch + bg_region * (1 - outer_3ch)
            
            # Edge sharpening only in high-confidence areas
            sharp_areas = mask > 0.8
            if np.any(sharp_areas):
                sharpen_kernel = np.array([[0, -0.05, 0], 
                                         [-0.05, 1.2, -0.05], 
                                         [0, -0.05, 0]])
                
                for c in range(3):
                    channel = final_blend[:, :, c]
                    sharpened = cv2.filter2D(channel, -1, sharpen_kernel)
                    final_blend[sharp_areas, c] = (channel[sharp_areas] * 0.85 + 
                                                  sharpened[sharp_areas] * 0.15)
            
            background[start_y:end_y, start_x:end_x] = np.clip(final_blend, 0, 255).astype(np.uint8)
            print("✨ Perfect blending complete")
            
        except Exception as e:
            print(f"⚠️ Blending failed: {e}")
        
        return background

def main():
    parser = argparse.ArgumentParser(description='Refined Vehicle Background Replacement')
    parser.add_argument('--input', required=True, help='Input image path')
    parser.add_argument('--background', required=True, help='Background image path')
    parser.add_argument('--output', required=True, help='Output image path')
    
    args = parser.parse_args()
    
    try:
        segmenter = VehicleSegmenter()
        replacer = RefinedReplacer()
        
        original = cv2.imread(args.input)
        background = cv2.imread(args.background)
        
        if original is None or background is None:
            print("❌ Could not load images")
            sys.exit(1)
        
        masks, boxes, confidences, class_ids = segmenter.segment_vehicle(args.input)
        
        if not masks:
            print("❌ No vehicles detected")
            sys.exit(1)
        
        main_mask = segmenter.get_best_mask(masks, boxes, confidences)
        result = replacer.replace_background_refined(original, main_mask, background)
        
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(args.output, result)
        
        print(f"✨ REFINED result saved to: {args.output}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
