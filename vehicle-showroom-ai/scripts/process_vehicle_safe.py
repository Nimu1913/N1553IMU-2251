#!/usr/bin/env python3
import os
import sys
import argparse
import cv2
import numpy as np
from pathlib import Path

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from src.detection.vehicle_segmenter import VehicleSegmenter

class SafeReplacer:
    def replace_background_safe(self, original_img, mask, background_img):
        print("🛡️ Safe background replacement starting...")
        
        h, w = original_img.shape[:2]
        bg_h, bg_w = background_img.shape[:2]
        
        # Simple mask processing - keep it safe
        if mask.shape != (h, w):
            mask = cv2.resize(mask, (w, h))
        
        if len(mask.shape) == 3:
            mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
        
        mask = mask.astype(np.float32)
        if mask.max() > 1.0:
            mask = mask / 255.0
        
        # Simple threshold - don't lose the car!
        mask = (mask > 0.2).astype(np.float32)
        
        # Find car bounds
        car_coords = np.where(mask > 0)
        if len(car_coords[0]) == 0:
            print("❌ No car found in mask!")
            return background_img
            
        y_min, y_max = car_coords[0].min(), car_coords[0].max()
        x_min, x_max = car_coords[1].min(), car_coords[1].max()
        car_height = y_max - y_min
        car_width = x_max - x_min
        
        print(f"🚗 Car found: {car_width}x{car_height} pixels")
        
        # Conservative scaling
        scale_factor = min(bg_w / (car_width * 1.5), bg_h / (car_height * 1.8))
        new_w = int(w * scale_factor)
        new_h = int(h * scale_factor)
        
        print(f"📏 Scaling to: {new_w}x{new_h}")
        
        # Resize
        original_resized = cv2.resize(original_img, (new_w, new_h))
        mask_resized = cv2.resize(mask, (new_w, new_h))
        
        # Position car
        start_x = (bg_w - new_w) // 2
        start_y = bg_h - new_h - int(bg_h * 0.1)
        
        start_x = max(0, min(start_x, bg_w - new_w))
        start_y = max(0, min(start_y, bg_h - new_h))
        
        print(f"📍 Positioning at: ({start_x}, {start_y})")
        
        # Simple blending - just smooth the edges a tiny bit
        mask_smooth = cv2.GaussianBlur(mask_resized, (3, 3), 0)
        mask_3ch = np.stack([mask_smooth] * 3, axis=-1)
        
        # Do the blending
        result = background_img.copy()
        
        end_y = start_y + new_h
        end_x = start_x + new_w
        
        if end_y <= background_img.shape[0] and end_x <= background_img.shape[1]:
            car_float = original_resized.astype(np.float32)
            bg_region = result[start_y:end_y, start_x:end_x].astype(np.float32)
            
            # Simple blend
            blended = car_float * mask_3ch + bg_region * (1 - mask_3ch)
            result[start_y:end_y, start_x:end_x] = blended.astype(np.uint8)
            
            print("✅ Car successfully placed!")
        else:
            print("❌ Car too big for background!")
        
        return result

def main():
    parser = argparse.ArgumentParser(description='Safe Vehicle Background Replacement')
    parser.add_argument('--input', required=True, help='Input image path')
    parser.add_argument('--background', required=True, help='Background image path')
    parser.add_argument('--output', required=True, help='Output image path')
    
    args = parser.parse_args()
    
    try:
        segmenter = VehicleSegmenter()
        replacer = SafeReplacer()
        
        original = cv2.imread(args.input)
        background = cv2.imread(args.background)
        
        if original is None or background is None:
            print("❌ Could not load images")
            sys.exit(1)
        
        print("🔍 Detecting vehicles...")
        masks, boxes, confidences, class_ids = segmenter.segment_vehicle(args.input)
        
        if not masks:
            print("❌ No vehicles detected")
            sys.exit(1)
        
        print(f"✅ Found {len(masks)} vehicles")
        
        main_mask = segmenter.get_best_mask(masks, boxes, confidences)
        result = replacer.replace_background_safe(original, main_mask, background)
        
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(args.output, result)
        
        print(f"🎉 SAFE result saved to: {args.output}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
