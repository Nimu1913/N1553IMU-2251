import torch
from diffusers import (
    StableDiffusionControlNetInpaintPipeline,
    ControlNetModel,
    DDIMScheduler,
    DPMSolverMultistepScheduler
)
from transformers import pipeline as hf_pipeline
from PIL import Image
import numpy as np
import cv2

class ControlNetFullGenerator:
    """
    Full ControlNet implementation with Stable Diffusion
    """
    
    def __init__(self, use_gpu=False):
        self.device = "cuda" if use_gpu and torch.cuda.is_available() else "cpu"
        self.dtype = torch.float16 if self.device == "cuda" else torch.float32
        
        print(f"ControlNet using device: {self.device}")
        
        # Model IDs
        self.sd_model_id = "runwayml/stable-diffusion-v1-5"
        self.controlnet_model_id = "lllyasviel/control_v11f1p_sd15_depth"
        
        self.pipe = None
        self.depth_estimator = None
        
        self._load_models()
    
    def _load_models(self):
        """Load ControlNet and SD models"""
        try:
            print("Loading ControlNet model...")
            # Load ControlNet
            controlnet = ControlNetModel.from_pretrained(
                self.controlnet_model_id,
                torch_dtype=self.dtype,
                use_safetensors=True
            )
            
            print("Loading Stable Diffusion pipeline...")
            # Load SD + ControlNet pipeline
            self.pipe = StableDiffusionControlNetInpaintPipeline.from_pretrained(
                self.sd_model_id,
                controlnet=controlnet,
                torch_dtype=self.dtype,
                safety_checker=None,
                requires_safety_checker=False,
                use_safetensors=True
            )
            
            # Use faster scheduler
            self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(
                self.pipe.scheduler.config
            )
            
            # Move to device
            self.pipe = self.pipe.to(self.device)
            
            # Enable optimizations
            if self.device == "cuda":
                self.pipe.enable_model_cpu_offload()
                if hasattr(self.pipe, 'enable_xformers_memory_efficient_attention'):
                    self.pipe.enable_xformers_memory_efficient_attention()
            
            # Load depth estimator
            print("Loading depth estimator...")
            self.depth_estimator = hf_pipeline(
                'depth-estimation',
                model='Intel/dpt-large'
            )
            
            print("ControlNet pipeline ready!")
            
        except Exception as e:
            print(f"Error loading ControlNet: {e}")
            print("Falling back to CPU mode...")
            self.device = "cpu"
            self.dtype = torch.float32
    
    def generate_car(self, 
                    background, 
                    mask,
                    prompt,
                    negative_prompt=None,
                    num_inference_steps=50,
                    guidance_scale=7.5,
                    controlnet_conditioning_scale=1.0):
        """
        Generate car using ControlNet guidance
        
        Args:
            background: PIL Image of background
            mask: PIL Image mask for inpainting
            prompt: Text prompt for car generation
            negative_prompt: Negative prompt
            num_inference_steps: Number of denoising steps (50 recommended)
            guidance_scale: Classifier-free guidance (7.5 recommended)
            controlnet_conditioning_scale: ControlNet strength (1.0 recommended)
        """
        
        if self.pipe is None:
            print("ControlNet not available, using placeholder")
            return background
        
        # Default negative prompt for cars
        if negative_prompt is None:
            negative_prompt = ("blurry, bad quality, worst quality, "
                             "cartoon, anime, sketches, distorted, "
                             "deformed, ugly, broken")
        
        # Generate depth map
        print("Generating depth map...")
        depth_map = self._generate_depth_map(background)
        
        # Ensure all images are same size
        size = background.size
        mask = mask.resize(size, Image.LANCZOS)
        depth_map = depth_map.resize(size, Image.LANCZOS)
        
        # Generate with ControlNet
        print(f"Generating car with {num_inference_steps} steps...")
        result = self.pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            image=background,
            mask_image=mask,
            control_image=depth_map,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            controlnet_conditioning_scale=controlnet_conditioning_scale,
            height=size[1],
            width=size[0]
        ).images[0]
        
        return result
    
    def _generate_depth_map(self, image):
        """Generate depth map from image"""
        depth = self.depth_estimator(image)['depth']
        
        # Convert to numpy and normalize
        depth_array = np.array(depth)
        depth_normalized = ((depth_array - depth_array.min()) / 
                          (depth_array.max() - depth_array.min()) * 255)
        
        # Apply some processing for better depth
        depth_normalized = cv2.medianBlur(depth_normalized.astype(np.uint8), 5)
        
        return Image.fromarray(depth_normalized)
    
    def generate_variations(self, 
                          background,
                          mask,
                          base_prompt,
                          num_variations=3):
        """Generate multiple car variations"""
        variations = []
        
        # Car style variations
        styles = [
            "luxury sports car, metallic paint, professional photography",
            "classic vintage car, chrome details, studio lighting",
            "modern SUV, matte finish, outdoor photography"
        ]
        
        for i, style in enumerate(styles[:num_variations]):
            prompt = f"{base_prompt}, {style}"
            print(f"Generating variation {i+1}: {style}")
            
            result = self.generate_car(
                background, 
                mask,
                prompt,
                num_inference_steps=30  # Faster for variations
            )
            variations.append(result)
        
        return variations
