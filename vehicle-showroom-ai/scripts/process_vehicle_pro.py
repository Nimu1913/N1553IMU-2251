#!/usr/bin/env python3
import os
import sys
import argparse
import cv2
import numpy as np
from pathlib import Path

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.detection.vehicle_segmenter import VehicleSegmenter
from src.segmentation.mask_refiner import MaskRefiner

# Import our professional replacer
exec(open('src/composition/professional_replacer.py').read())

def process_vehicle_professional(input_path, background_path, output_path):
    try:
        print("🏆 Starting PROFESSIONAL vehicle processing...")
        
        # Initialize components
        segmenter = VehicleSegmenter()
        replacer = ProfessionalReplacer()
        
        print(f"📁 Processing: {input_path}")
        
        # Load images
        original = cv2.imread(input_path)
        background = cv2.imread(background_path)
        
        if original is None or background is None:
            print(f"❌ Could not load images")
            return False
        
        print(f"📊 Images loaded successfully")
        
        # Segment vehicle
        masks, boxes, confidences, class_ids = segmenter.segment_vehicle(input_path)
        
        if not masks:
            print("❌ No vehicles detected")
            return False
        
        # Get best mask
        main_mask = segmenter.get_best_mask(masks, boxes, confidences)
        if main_mask is None:
            return False
        
        # Professional background replacement with ALL enhancements
        result = replacer.replace_background_professional(original, main_mask, background)
        
        # Create output directory
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Save result
        cv2.imwrite(output_path, result)
        print(f"🎉 PROFESSIONAL result saved to: {output_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Professional Vehicle Background Replacement')
    parser.add_argument('--input', required=True, help='Input image path')
    parser.add_argument('--background', required=True, help='Background image path')
    parser.add_argument('--output', required=True, help='Output image path')
    
    args = parser.parse_args()
    
    success = process_vehicle_professional(args.input, args.background, args.output)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
