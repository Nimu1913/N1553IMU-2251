#!/usr/bin/env python3
import sys
sys.path.append('src')

print("Testing Advanced AI Models...")
print("=" * 50)

# Test SAM
print("\n1. Testing SAM Segmentation...")
try:
    from models.segmentation.sam_implementation import SAMSegmenter
    sam = SAMSegmenter()
    print("✓ SAM loaded successfully")
except Exception as e:
    print(f"✗ SAM failed: {e}")

# Test Harmonization
print("\n2. Testing Harmonization...")
try:
    from models.harmonization.harmonization_implementation import ImageHarmonizer
    harmonizer = ImageHarmonizer()
    print("✓ Harmonization loaded successfully")
except Exception as e:
    print(f"✗ Harmonization failed: {e}")

# Test Shadow
print("\n3. Testing Shadow Generation...")
try:
    from models.shadow.shadow_implementation import ShadowGenerator
    shadow = ShadowGenerator()
    print("✓ Shadow generator loaded successfully")
except Exception as e:
    print(f"✗ Shadow failed: {e}")

# Test Pipeline
print("\n4. Testing Complete Pipeline...")
try:
    from pipeline_implementation import AdvancedCarReplacementPipeline
    pipeline = AdvancedCarReplacementPipeline()
    
    # Process test image
    result = pipeline.process(
        "test_images/test_car.jpg",
        "test_images/sporty.jpg"
    )
    
    if result:
        result.save("test_advanced_output.jpg")
        print("✓ Pipeline executed successfully!")
        print("✓ Output saved as test_advanced_output.jpg")
except Exception as e:
    print(f"✗ Pipeline failed: {e}")

print("\n" + "=" * 50)
print("Testing complete!")
