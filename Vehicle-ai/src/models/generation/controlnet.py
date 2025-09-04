import torch
import numpy as np
from typing import Dict, Optional, Union, List
from diffusers import (
    StableDiffusionControlNetInpaintPipeline,
    ControlNetModel,
    DDIMScheduler,
    EulerAncestralDiscreteScheduler
)
from PIL import Image
import cv2
from ...core.config import config
from ...utils.logger import get_logger

logger = get_logger(__name__)

class ControlNetGenerator:
    def __init__(self):
        self.device = config.model.sam_device
        self.model_path = config.get_model_path("controlnet")
        self.sd_model_id = "runwayml/stable-diffusion-v1-5"
        self.pipe = None
        self.controlnet = None

    def load(self):
        try:
            logger.info("Loading ControlNet model")
            self.controlnet = ControlNetModel.from_pretrained(
                str(self.model_path),
                torch_dtype=torch.float16 if config.pipeline.use_fp16 else torch.float32
            )
            
            self.pipe = StableDiffusionControlNetInpaintPipeline.from_pretrained(
                self.sd_model_id,
                controlnet=self.controlnet,
                torch_dtype=torch.float16 if config.pipeline.use_fp16 else torch.float32,
                safety_checker=None,
                requires_safety_checker=False
            )
            
            if config.pipeline.use_tensorrt:
                self.pipe.enable_xformers_memory_efficient_attention()
            
            self.pipe.scheduler = DDIMScheduler.from_config(self.pipe.scheduler.config)
            self.pipe = self.pipe.to(self.device)
            self.pipe.enable_model_cpu_offload()
            
            logger.info("ControlNet model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load ControlNet model: {e}")
            raise

    def generate_car(self,
                     background_image: Image.Image,
                     mask_image: Image.Image,
                     control_image: Image.Image,
                     prompt: str,
                     negative_prompt: Optional[str] = None,
                     num_inference_steps: Optional[int] = None,
                     guidance_scale: Optional[float] = None,
                     controlnet_conditioning_scale: Optional[float] = None) -> Image.Image:
        try:
            negative_prompt = negative_prompt or config.model.sd_negative_prompt
            num_inference_steps = num_inference_steps or config.model.sd_num_inference_steps
            guidance_scale = guidance_scale or config.model.sd_guidance_scale
            controlnet_conditioning_scale = controlnet_conditioning_scale or config.model.controlnet_conditioning_scale
            
            size = background_image.size
            mask_image = mask_image.resize(size, Image.LANCZOS)
            control_image = control_image.resize(size, Image.LANCZOS)
            
            with torch.inference_mode():
                result = self.pipe(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    image=background_image,
                    mask_image=mask_image,
                    control_image=control_image,
                    num_inference_steps=num_inference_steps,
                    guidance_scale=guidance_scale,
                    controlnet_conditioning_scale=controlnet_conditioning_scale,
                    width=size[0],
                    height=size[1]
                ).images[0]
            
            return result
        except Exception as e:
            logger.error(f"Car generation failed: {e}")
            raise

    def prepare_depth_control(self, image: np.ndarray) -> Image.Image:
        from transformers import pipeline
        depth_estimator = pipeline('depth-estimation')
        depth = depth_estimator(Image.fromarray(image))['depth']
        depth_array = np.array(depth)
        depth_normalized = ((depth_array - depth_array.min()) / 
                           (depth_array.max() - depth_array.min()) * 255).astype(np.uint8)
        return Image.fromarray(depth_normalized)
