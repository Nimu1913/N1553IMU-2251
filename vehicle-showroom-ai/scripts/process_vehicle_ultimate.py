#!/usr/bin/env python3
import os
import sys
import argparse
import cv2
import numpy as np
from pathlib import Path

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.detection.vehicle_segmenter import VehicleSegmenter

class UltimateReplacer:
    def replace_background_ultimate(self, original_img, mask, background_img):
        print("🎨 Ultimate background replacement starting...")
        
        h, w = original_img.shape[:2]
        bg_h, bg_w = background_img.shape[:2]
        
        mask = self.enhance_mask(mask, h, w)
        
        car_coords = np.where(mask > 0.1)
        if len(car_coords[0]) == 0:
            return background_img
            
        y_min, y_max = car_coords[0].min(), car_coords[0].max()
        x_min, x_max = car_coords[1].min(), car_coords[1].max()
        car_height = y_max - y_min
        car_width = x_max - x_min
        
        scale_factor = min(bg_w / (car_width * 1.3), bg_h / (car_height * 1.5))
        new_w = int(w * scale_factor)
        new_h = int(h * scale_factor)
        
        original_resized = cv2.resize(original_img, (new_w, new_h))
        mask_resized = cv2.resize(mask, (new_w, new_h))
        
        start_x = int((bg_w - new_w) * 0.4)
        start_y = bg_h - new_h - int(bg_h * 0.1)
        
        start_x = max(0, min(start_x, bg_w - new_w))
        start_y = max(0, min(start_y, bg_h - new_h))
        
        enhanced_car = self.enhance_car_appearance(original_resized, background_img)
        result = self.add_shadow(background_img.copy(), mask_resized, start_x, start_y, new_w, new_h)
        result = self.ultimate_blend(result, enhanced_car, mask_resized, start_x, start_y)
        
        print("✅ Ultimate replacement complete!")
        return result
    
    def enhance_mask(self, mask, target_h, target_w):
        if mask.shape != (target_h, target_w):
            mask = cv2.resize(mask, (target_w, target_h))
        
        if len(mask.shape) == 3:
            mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
        
        mask = mask.astype(np.float32)
        if mask.max() > 1.0:
            mask = mask / 255.0
        
        binary = (mask > 0.3).astype(np.uint8)
        
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)
        
        dist = cv2.distanceTransform(cleaned, cv2.DIST_L2, 5)
        feathered = np.clip(dist / 6.0, 0, 1)
        
        final_mask = cv2.GaussianBlur(feathered, (5, 5), 0)
        
        return final_mask
    
    def enhance_car_appearance(self, car_img, background_img):
        car_lab = cv2.cvtColor(car_img, cv2.COLOR_BGR2LAB).astype(np.float32)
        bg_lab = cv2.cvtColor(background_img, cv2.COLOR_BGR2LAB).astype(np.float32)
        
        bg_brightness = np.mean(bg_lab[:, :, 0])
        car_brightness = np.mean(car_lab[:, :, 0])
        brightness_adjustment = (bg_brightness - car_brightness) * 0.2
        
        car_lab[:, :, 0] = np.clip(car_lab[:, :, 0] + brightness_adjustment, 0, 255)
        car_lab[:, :, 0] = np.clip((car_lab[:, :, 0] - 127) * 1.1 + 127, 0, 255)
        
        enhanced = cv2.cvtColor(car_lab.astype(np.uint8), cv2.COLOR_LAB2BGR)
        
        return enhanced
    
    def add_shadow(self, background, mask, start_x, start_y, car_w, car_h):
        try:
            shadow_mask = mask.copy()
            shadow_height = int(shadow_mask.shape[0] * 0.3)
            shadow_mask[:shadow_mask.shape[0] - shadow_height, :] = 0
            
            shadow_h = int(car_h * 0.4)
            shadow = np.zeros((shadow_h, car_w), dtype=np.float32)
            
            for i in range(shadow_h):
                fade = 1.0 - (i / shadow_h) ** 0.5
                width_scale = 1.0 - (i / shadow_h) * 0.3
                
                if fade > 0.1:
                    shadow_row = cv2.resize(shadow_mask[-1, :].reshape(1, -1), 
                                          (int(car_w * width_scale), 1))[0]
                    
                    start_col = (car_w - len(shadow_row)) // 2
                    end_col = start_col + len(shadow_row)
                    
                    if start_col >= 0 and end_col <= car_w:
                        shadow[i, start_col:end_col] = shadow_row * fade * 0.6
            
            shadow = cv2.GaussianBlur(shadow, (13, 13), 0)
            
            shadow_start_y = start_y + car_h - 20
            shadow_end_y = shadow_start_y + shadow_h
            
            if shadow_end_y <= background.shape[0]:
                for c in range(3):
                    bg_region = background[shadow_start_y:shadow_end_y, 
                                         start_x:start_x + car_w, c].astype(np.float32)
                    bg_region *= (1 - shadow)
                    background[shadow_start_y:shadow_end_y, 
                             start_x:start_x + car_w, c] = bg_region
            
            print("✅ Realistic shadow added")
            
        except Exception as e:
            print(f"⚠️ Shadow creation failed: {e}")
        
        return background
    
    def ultimate_blend(self, background, car_img, mask, start_x, start_y):
        try:
            end_y = start_y + car_img.shape[0]
            end_x = start_x + car_img.shape[1]
            
            if end_y > background.shape[0] or end_x > background.shape[1]:
                return background
            
            mask_smooth = cv2.GaussianBlur(mask, (9, 9), 0)
            mask_smooth = np.power(mask_smooth, 1.3)
            mask_3ch = np.stack([mask_smooth] * 3, axis=-1)
            
            car_float = car_img.astype(np.float32)
            bg_region = background[start_y:end_y, start_x:end_x].astype(np.float32)
            
            blended = car_float * mask_3ch + bg_region * (1 - mask_3ch)
            
            strong_edges = mask_smooth > 0.7
            if np.any(strong_edges):
                kernel = np.array([[0, -0.1, 0], [-0.1, 1.4, -0.1], [0, -0.1, 0]])
                for c in range(3):
                    channel = blended[:, :, c]
                    enhanced = cv2.filter2D(channel, -1, kernel)
                    blended[strong_edges, c] = (channel[strong_edges] * 0.8 + 
                                               enhanced[strong_edges] * 0.2)
            
            background[start_y:end_y, start_x:end_x] = np.clip(blended, 0, 255).astype(np.uint8)
            print("✅ Ultimate blending complete")
            
        except Exception as e:
            print(f"⚠️ Blending failed: {e}")
        
        return background

def main():
    parser = argparse.ArgumentParser(description='Ultimate Vehicle Background Replacement')
    parser.add_argument('--input', required=True, help='Input image path')
    parser.add_argument('--background', required=True, help='Background image path')
    parser.add_argument('--output', required=True, help='Output image path')
    
    args = parser.parse_args()
    
    try:
        segmenter = VehicleSegmenter()
        replacer = UltimateReplacer()
        
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
        result = replacer.replace_background_ultimate(original, main_mask, background)
        
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(args.output, result)
        
        print(f"🎉 ULTIMATE result saved to: {args.output}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
