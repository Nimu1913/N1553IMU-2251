import os
from typing import Dict, Any, Optional
from pydantic import BaseSettings, Field
from pathlib import Path

class ModelConfig(BaseSettings):
    sam_model_path: str = Field(default="models/weights/sam/sam_vit_h_4b8939.pth")
    sam_model_type: str = Field(default="vit_h")
    sam_device: str = Field(default="cuda")
    
    controlnet_model_path: str = Field(default="models/weights/controlnet/control_v11f1p_sd15_depth.pth")
    controlnet_conditioning_scale: float = Field(default=1.0)
    controlnet_guidance_scale: float = Field(default=7.5)
    
    sd_model_path: str = Field(default="models/weights/stable_diffusion/sd-v1-5.ckpt")
    sd_num_inference_steps: int = Field(default=50)
    sd_guidance_scale: float = Field(default=7.5)
    sd_negative_prompt: str = Field(default="blurry, bad quality, worst quality")
    
    lanpaint_total_steps: int = Field(default=50)
    lanpaint_thinking_steps: int = Field(default=10)
    lanpaint_lambda: float = Field(default=7.0)
    
    harmonization_model_path: str = Field(default="models/weights/harmonization/dovenet_pretrained.pth")
    harmonization_device: str = Field(default="cuda")
    
    shadow_model_path: str = Field(default="models/weights/shadow/sgrnet_pretrained.pth")
    shadow_device: str = Field(default="cuda")
    
    class Config:
        env_prefix = "MODEL_"
        case_sensitive = False

class PipelineConfig(BaseSettings):
    max_image_size: int = Field(default=2048)
    batch_size: int = Field(default=4)
    enable_caching: bool = Field(default=True)
    cache_ttl: int = Field(default=3600)
    quality_threshold: float = Field(default=0.8)
    enable_quality_check: bool = Field(default=True)
    use_fp16: bool = Field(default=True)
    use_tensorrt: bool = Field(default=False)
    num_workers: int = Field(default=4)
    
    class Config:
        env_prefix = "PIPELINE_"
        case_sensitive = False

class ServiceConfig(BaseSettings):
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8000)
    api_workers: int = Field(default=4)
    redis_host: str = Field(default="localhost")
    redis_port: int = Field(default=6379)
    redis_db: int = Field(default=0)
    redis_password: Optional[str] = Field(default=None)
    rabbitmq_host: str = Field(default="localhost")
    rabbitmq_port: int = Field(default=5672)
    rabbitmq_user: str = Field(default="guest")
    rabbitmq_password: str = Field(default="guest")
    triton_url: str = Field(default="localhost:8001")
    triton_model_version: str = Field(default="1")
    enable_monitoring: bool = Field(default=True)
    prometheus_port: int = Field(default=9090)
    
    class Config:
        env_prefix = "SERVICE_"
        case_sensitive = False

class Config:
    def __init__(self):
        self.model = ModelConfig()
        self.pipeline = PipelineConfig()
        self.service = ServiceConfig()
        self.project_root = Path(__file__).parent.parent.parent
        self.models_dir = self.project_root / "models"
        self.weights_dir = self.models_dir / "weights"
        self.configs_dir = self.models_dir / "configs"
        self.logs_dir = self.project_root / "logs"
        self.logs_dir.mkdir(parents=True, exist_ok=True)
    
    def get_model_path(self, model_name: str) -> Path:
        return self.project_root / self.model.__dict__[f"{model_name}_model_path"]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "model": self.model.dict(),
            "pipeline": self.pipeline.dict(),
            "service": self.service.dict()
        }

config = Config()
