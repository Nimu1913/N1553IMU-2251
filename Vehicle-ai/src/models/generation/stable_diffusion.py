import torch
from diffusers import StableDiffusionPipeline, StableDiffusionInpaintPipeline
from PIL import Image
import numpy as np
from ...core.config import config
from ...utils.logger import get_logger

logger = get_logger(__name__)

class StableDiffusionModel:
    def __init__(self):
        self.device = config.model.sam_device
        self.model_path = config.get_model_path("sd")
        self.pipe = None
        self.inpaint_pipe = None
    
    def load(self):
        logger.info("Loading Stable Diffusion model")
        self.pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float16 if config.pipeline.use_fp16 else torch.float32
        )
        self.pipe = self.pipe.to(self.device)
        
        self.inpaint_pipe = StableDiffusionInpaintPipeline.from_pretrained(
            "runwayml/stable-diffusion-inpainting",
            torch_dtype=torch.float16 if config.pipeline.use_fp16 else torch.float32
        )
        self.inpaint_pipe = self.inpaint_pipe.to(self.device)
        logger.info("Stable Diffusion model loaded successfully")
    
    def generate(self, prompt: str, negative_prompt: str = None, 
                 num_inference_steps: int = 50) -> Image.Image:
        return self.pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=num_inference_steps
        ).images[0]
    
    def inpaint(self, image: Image.Image, mask: Image.Image, 
                prompt: str, negative_prompt: str = None) -> Image.Image:
        return self.inpaint_pipe(
            prompt=prompt,
            image=image,
            mask_image=mask,
            negative_prompt=negative_prompt
        ).images[0]
