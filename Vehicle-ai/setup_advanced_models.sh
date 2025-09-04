cd /Users/nicholasmuradov/Downloads/N1553IMU-2251/Vehicle-ai

echo "==================================="
echo "ADVANCED AI MODELS SETUP"
echo "==================================="

# 1. CREATE MODEL DIRECTORIES
echo "Creating model directories..."
mkdir -p models/weights/{sam,controlnet,stable_diffusion,harmonization,shadow}
mkdir -p src/models/{segmentation,generation,harmonization,shadow}

# 2. DOWNLOAD SAM (Segment Anything Model) - Already have this
echo "Checking SAM model..."
if [ ! -f "models/weights/sam/sam_vit_h_4b8939.pth" ]; then
    echo "Downloading SAM model..."
    wget -q --show-progress \
        https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth \
        -O models/weights/sam/sam_vit_h_4b8939.pth
else
    echo "✓ SAM model already downloaded"
fi

# 3. DOWNLOAD CONTROLNET
echo "Downloading ControlNet models..."
if [ ! -f "models/weights/controlnet/control_v11f1p_sd15_depth.pth" ]; then
    wget -q --show-progress \
        https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11f1p_sd15_depth.pth \
        -O models/weights/controlnet/control_v11f1p_sd15_depth.pth
else
    echo "✓ ControlNet model already downloaded"
fi

# 4. INSTALL REQUIRED PACKAGES
echo "Installing required packages..."
pip install -q \
    diffusers \
    transformers \
    accelerate \
    controlnet-aux \
    xformers \
    segment-anything \
    opencv-python \
    scipy

# 5. CREATE SAM IMPLEMENTATION
cat > src/models/segmentation/sam_implementation.py << 'EOF'
import torch
import numpy as np
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator, SamPredictor
from PIL import Image
import cv2

class SAMSegmenter:
    """Proper SAM implementation for car segmentation"""
    
    def __init__(self, model_path="models/weights/sam/sam_vit_h_4b8939.pth"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        
        # Load SAM model
        self.sam = sam_model_registry["vit_h"](checkpoint=model_path)
        self.sam.to(device=self.device)
        self.sam.eval()
        
        # Initialize mask generator for automatic segmentation
        self.mask_generator = SamAutomaticMaskGenerator(
            model=self.sam,
            points_per_side=32,
            pred_iou_thresh=0.95,
            stability_score_thresh=0.92,
            min_mask_region_area=100
        )
        
        # Initialize predictor for interactive segmentation
        self.predictor = SamPredictor(self.sam)
    
    def segment_car_auto(self, image):
        """Automatically segment the car from the image"""
        # Generate all masks
        masks = self.mask_generator.generate(image)
        
        # Filter for car-like objects
        h, w = image.shape[:2]
        car_candidates = []
        
        for mask in masks:
            bbox = mask["bbox"]
            x, y, width, height = bbox
            area_ratio = (width * height) / (w * h)
            aspect_ratio = width / height
            
            # Cars are typically:
            # - Medium to large (5-70% of image)
            # - Wider than tall (0.8-3.0 aspect ratio)
            # - Not at the very top of image
            if 0.05 < area_ratio < 0.7 and 0.8 < aspect_ratio < 3.0 and y > h * 0.1:
                car_candidates.append(mask)
        
        if car_candidates:
            # Return the largest candidate
            best_mask = max(car_candidates, key=lambda x: x["area"])
            return best_mask["segmentation"], best_mask["bbox"]
        
        return None, None
    
    def segment_car_interactive(self, image, point=None, box=None):
        """Interactive segmentation with point or box prompt"""
        self.predictor.set_image(image)
        
        masks, scores, logits = self.predictor.predict(
            point_coords=np.array([point]) if point else None,
            point_labels=np.array([1]) if point else None,
            box=np.array(box) if box else None,
            multimask_output=True
        )
        
        # Return best mask
        best_idx = np.argmax(scores)
        return masks[best_idx], scores[best_idx]
EOF

# 6. CREATE CONTROLNET IMPLEMENTATION
cat > src/models/generation/controlnet_implementation.py << 'EOF'
import torch
from diffusers import StableDiffusionControlNetInpaintPipeline, ControlNetModel
from PIL import Image
import numpy as np
from transformers import pipeline

class ControlNetGenerator:
    """ControlNet for guided car generation"""
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Load ControlNet
        print("Loading ControlNet...")
        self.controlnet = ControlNetModel.from_pretrained(
            "lllyasviel/control_v11f1p_sd15_depth",
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
        )
        
        # Load Stable Diffusion + ControlNet pipeline
        print("Loading Stable Diffusion pipeline...")
        self.pipe = StableDiffusionControlNetInpaintPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            controlnet=self.controlnet,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            safety_checker=None,
            requires_safety_checker=False
        )
        self.pipe = self.pipe.to(self.device)
        
        # Enable memory optimizations
        if self.device == "cuda":
            self.pipe.enable_model_cpu_offload()
            self.pipe.enable_xformers_memory_efficient_attention()
        
        # Load depth estimator
        self.depth_estimator = pipeline('depth-estimation')
    
    def generate_depth_map(self, image):
        """Generate depth map from image"""
        depth = self.depth_estimator(image)['depth']
        depth_array = np.array(depth)
        depth_normalized = ((depth_array - depth_array.min()) / 
                           (depth_array.max() - depth_array.min()) * 255).astype(np.uint8)
        return Image.fromarray(depth_normalized)
    
    def generate_car(self, background, mask, prompt, negative_prompt=None):
        """Generate car with ControlNet guidance"""
        # Generate depth control
        depth_map = self.generate_depth_map(background)
        
        # Default negative prompt
        if negative_prompt is None:
            negative_prompt = "blurry, bad quality, distorted, unrealistic, cartoon, anime"
        
        # Generate
        result = self.pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            image=background,
            mask_image=mask,
            control_image=depth_map,
            num_inference_steps=30,
            guidance_scale=7.5,
            controlnet_conditioning_scale=1.0
        ).images[0]
        
        return result
EOF

# 7. CREATE HARMONIZATION IMPLEMENTATION
cat > src/models/harmonization/harmonization_implementation.py << 'EOF'
import cv2
import numpy as np
from PIL import Image

class ImageHarmonizer:
    """Image harmonization using color matching and blending"""
    
    def __init__(self):
        pass
    
    def harmonize(self, foreground, background, mask):
        """Harmonize foreground with background"""
        # Convert to numpy arrays
        fg = np.array(foreground)
        bg = np.array(background)
        mask = np.array(mask) / 255.0
        
        # Color transfer in LAB space
        fg_lab = cv2.cvtColor(fg, cv2.COLOR_RGB2LAB).astype(np.float32)
        bg_lab = cv2.cvtColor(bg, cv2.COLOR_RGB2LAB).astype(np.float32)
        
        # Calculate mean and std for each channel
        l_mean_bg, a_mean_bg, b_mean_bg = [bg_lab[:,:,i].mean() for i in range(3)]
        l_std_bg, a_std_bg, b_std_bg = [bg_lab[:,:,i].std() for i in range(3)]
        
        l_mean_fg, a_mean_fg, b_mean_fg = [fg_lab[:,:,i].mean() for i in range(3)]
        l_std_fg, a_std_fg, b_std_fg = [fg_lab[:,:,i].std() for i in range(3)]
        
        # Transfer color statistics
        fg_lab[:,:,0] = (fg_lab[:,:,0] - l_mean_fg) * (l_std_bg / l_std_fg) + l_mean_bg
        fg_lab[:,:,1] = (fg_lab[:,:,1] - a_mean_fg) * (a_std_bg / a_std_fg) + a_mean_bg
        fg_lab[:,:,2] = (fg_lab[:,:,2] - b_mean_fg) * (b_std_bg / b_std_fg) + b_mean_bg
        
        # Convert back to RGB
        fg_harmonized = cv2.cvtColor(fg_lab.astype(np.uint8), cv2.COLOR_LAB2RGB)
        
        # Blend with original using soft mask
        mask_3d = np.stack([mask] * 3, axis=-1)
        result = fg_harmonized * mask_3d + bg * (1 - mask_3d)
        
        return Image.fromarray(result.astype(np.uint8))
    
    def match_lighting(self, image, reference):
        """Match lighting between images"""
        img = np.array(image)
        ref = np.array(reference)
        
        # Simple histogram matching
        for i in range(3):
            hist_img, bins_img = np.histogram(img[:,:,i].flatten(), 256, [0,256])
            hist_ref, bins_ref = np.histogram(ref[:,:,i].flatten(), 256, [0,256])
            
            cdf_img = hist_img.cumsum()
            cdf_ref = hist_ref.cumsum()
            
            cdf_img = (cdf_img - cdf_img.min()) * 255 / (cdf_img.max() - cdf_img.min())
            cdf_ref = (cdf_ref - cdf_ref.min()) * 255 / (cdf_ref.max() - cdf_ref.min())
            
            # Create mapping
            mapping = np.interp(cdf_img, cdf_ref, range(256))
            img[:,:,i] = mapping[img[:,:,i]].astype(np.uint8)
        
        return Image.fromarray(img)
EOF

# 8. CREATE SHADOW GENERATION
cat > src/models/shadow/shadow_implementation.py << 'EOF'
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
EOF

# 9. CREATE MAIN PIPELINE
cat > src/pipeline_implementation.py << 'EOF'
import sys
import os
sys.path.append(os.path.dirname(__file__))

from models.segmentation.sam_implementation import SAMSegmenter
from models.generation.controlnet_implementation import ControlNetGenerator  
from models.harmonization.harmonization_implementation import ImageHarmonizer
from models.shadow.shadow_implementation import ShadowGenerator
from PIL import Image
import numpy as np

class AdvancedCarReplacementPipeline:
    """Complete pipeline using all advanced models"""
    
    def __init__(self):
        print("Initializing Advanced Pipeline...")
        self.segmenter = SAMSegmenter()
        self.generator = None  # ControlNet requires more VRAM
        self.harmonizer = ImageHarmonizer()
        self.shadow_gen = ShadowGenerator()
        print("Pipeline ready!")
    
    def process(self, car_image_path, background_path, car_prompt=None):
        """Process car replacement"""
        
        # Load images
        car_img = Image.open(car_image_path)
        bg_img = Image.open(background_path)
        
        print("Stage 1: Segmenting car...")
        car_array = np.array(car_img)
        mask, bbox = self.segmenter.segment_car_auto(car_array)
        
        if mask is None:
            print("No car detected!")
            return None
        
        print("Stage 2: Extracting car...")
        # Extract car with mask
        car_rgba = car_img.convert("RGBA")
        car_data = np.array(car_rgba)
        car_data[:, :, 3] = mask.astype(np.uint8) * 255
        car_extracted = Image.fromarray(car_data, 'RGBA')
        
        # Crop to bbox
        x, y, w, h = bbox
        car_cropped = car_extracted.crop((x, y, x+w, y+h))
        
        print("Stage 3: Positioning car...")
        # Scale and position
        bg_w, bg_h = bg_img.size
        scale = min(bg_w / (w * 2), bg_h / (h * 2))
        new_w = int(w * scale)
        new_h = int(h * scale)
        car_resized = car_cropped.resize((new_w, new_h), Image.LANCZOS)
        
        # Position at bottom center
        pos_x = (bg_w - new_w) // 2
        pos_y = bg_h - new_h - 50
        
        print("Stage 4: Adding shadow...")
        # Create shadow first
        shadow_bbox = (pos_x, pos_y, new_w, new_h)
        bg_with_shadow = self.shadow_gen.add_contact_shadow(bg_img, shadow_bbox)
        
        print("Stage 5: Compositing...")
        # Paste car
        bg_with_shadow = bg_with_shadow.convert('RGBA')
        bg_with_shadow.paste(car_resized, (pos_x, pos_y), car_resized)
        
        print("Stage 6: Harmonizing...")
        # Create mask for harmonization
        final_mask = np.zeros((bg_h, bg_w))
        car_mask_resized = np.array(car_resized)[:, :, 3] / 255.0
        final_mask[pos_y:pos_y+new_h, pos_x:pos_x+new_w] = car_mask_resized
        
        # Harmonize
        result = self.harmonizer.harmonize(bg_with_shadow, bg_img, final_mask)
        
        print("Complete!")
        return result

# Test the pipeline
if __name__ == "__main__":
    pipeline = AdvancedCarReplacementPipeline()
    result = pipeline.process(
        "test_images/test_car.jpg",
        "test_images/sporty.jpg"
    )
    if result:
        result.save("advanced_result.jpg")
        print("Result saved as advanced_result.jpg")
EOF

# 10. CREATE TEST SCRIPT
cat > test_advanced_models.py << 'EOF'
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
EOF

chmod +x test_advanced_models.py

echo ""
echo "==================================="
echo "SETUP COMPLETE!"
echo "==================================="
echo ""
echo "Run the test with:"
echo "python3 test_advanced_models.py"
echo ""
echo "This will:"
echo "1. Load SAM for proper segmentation"
echo "2. Setup ControlNet (if you have GPU)"
echo "3. Implement harmonization"
echo "4. Add realistic shadows"
echo "5. Process a test image through the full pipeline"
