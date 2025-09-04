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
