#!/usr/bin/env python3
import sys
sys.path.append('src')

print("Testing Research Models Implementation")
print("=" * 50)

# Check GPU
import torch
gpu_available = torch.cuda.is_available()
print(f"GPU Available: {gpu_available}")
if gpu_available:
    print(f"GPU Name: {torch.cuda.get_device_name(0)}")
print()

# Test DoveNet
print("1. Testing DoveNet Harmonization...")
try:
    from models.harmonization.dovenet import DoveNetHarmonizer
    harmonizer = DoveNetHarmonizer()
    print("✓ DoveNet loaded")
except Exception as e:
    print(f"✗ DoveNet error: {e}")

# Test SGRNet  
print("\n2. Testing SGRNet Shadow Generation...")
try:
    from models.shadow.sgrnet import SGRNetShadowGenerator
    shadow_gen = SGRNetShadowGenerator()
    print("✓ SGRNet loaded")
except Exception as e:
    print(f"✗ SGRNet error: {e}")

# Test ControlNet
print("\n3. Testing ControlNet + Stable Diffusion...")
try:
    from models.generation.controlnet_full import ControlNetFullGenerator
    generator = ControlNetFullGenerator(use_gpu=gpu_available)
    print("✓ ControlNet loaded")
except Exception as e:
    print(f"✗ ControlNet error: {e}")

# Test Full Research Pipeline
print("\n4. Testing Complete Research Pipeline...")
try:
    from pipeline.research_pipeline import ResearchPipeline
    
    pipeline = ResearchPipeline(use_gpu=gpu_available)
    
    # Test with extraction (no ControlNet generation needed)
    result = pipeline.process(
        background_path="test_images/sporty.jpg",
        car_image_path="test_images/test_car.jpg",
        use_controlnet=False
    )
    
    if result:
        result.save("research_result.jpg")
        print("✓ Research pipeline complete!")
        print("✓ Result saved as research_result.jpg")
    else:
        print("✗ Pipeline failed")
        
except Exception as e:
    print(f"✗ Research pipeline error: {e}")

print("\n" + "=" * 50)
print("Note: Full ControlNet generation requires GPU with 8GB+ VRAM")
print("Without GPU, using extraction + advanced harmonization/shadows")
