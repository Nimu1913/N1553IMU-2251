#!/usr/bin/env python3
import os
import sys
import argparse
import cv2
import numpy as np
from pathlib import Path

# Add current directory to Python path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.detection.vehicle_segmenter import VehicleSegmenter
from src.composition.background_replacer import BackgroundReplacer
from src.segmentation.mask_refiner import MaskRefiner

def process_single_image(input_path, background_path, output_path):
    try:
        # Initialize components
        segmenter = VehicleSegmenter()
        replacer = BackgroundReplacer()
        refiner = MaskRefiner()
        
        print(f"Processing: {input_path}")
        
        # Load images
        original = cv2.imread(input_path)
        background = cv2.imread(background_path)
        
        if original is None:
            print(f"Error: Could not load input image: {input_path}")
            return False
        
        if background is None:
            print(f"Error: Could not load background image: {background_path}")
            return False
        
        # Segment vehicle
        masks, boxes, confidences, class_ids = segmenter.segment_vehicle(input_path)
        
        if not masks:
            print("No vehicles detected in the image")
            return False
        
        # Get best mask
        main_mask = segmenter.get_best_mask(masks, boxes, confidences)
        
        if main_mask is None:
            print("Could not extract vehicle mask")
            return False
        
        # Refine mask
        refined_mask = refiner.refine_mask(main_mask)
        
        # Replace background
        result = replacer.replace_background(original, refined_mask, background)
        
        # Create output directory if it doesn't exist
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Save result
        cv2.imwrite(output_path, result)
        print(f"Success: Saved result to {output_path}")
        
        return True
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Vehicle Background Replacement')
    parser.add_argument('--input', required=True, help='Input image path')
    parser.add_argument('--background', required=True, help='Background image path')
    parser.add_argument('--output', required=True, help='Output image path')
    
    args = parser.parse_args()
    
    success = process_single_image(args.input, args.background, args.output)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
