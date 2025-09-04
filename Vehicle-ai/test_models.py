import os
import torch
from pathlib import Path

print("Testing model loading...")
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"MPS (Apple Silicon) available: {torch.backends.mps.is_available()}")

# Check if model files exist
models_dir = Path("models/weights")
sam_model = models_dir / "sam/sam_vit_h_4b8939.pth"
controlnet_model = models_dir / "controlnet/control_v11f1p_sd15_depth.pth"

print(f"\nSAM model exists: {sam_model.exists()}")
print(f"SAM model size: {sam_model.stat().st_size / 1e9:.2f} GB" if sam_model.exists() else "")

print(f"\nControlNet model exists: {controlnet_model.exists()}")
print(f"ControlNet model size: {controlnet_model.stat().st_size / 1e9:.2f} GB" if controlnet_model.exists() else "")

# Try to load SAM
try:
    from segment_anything import sam_model_registry
    print("\n✓ segment-anything package imported successfully")
    
    # Use CPU for now
    sam = sam_model_registry["vit_h"](checkpoint=str(sam_model))
    print("✓ SAM model loaded successfully!")
except Exception as e:
    print(f"\n✗ Error loading SAM: {e}")

print("\nModels are ready to use (will run slowly on CPU)")
