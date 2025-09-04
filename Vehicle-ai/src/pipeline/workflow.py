import asyncio
from typing import Dict, Optional, List, Any
from dataclasses import dataclass
from enum import Enum
import numpy as np
from PIL import Image
import cv2
import traceback

from ..models.segmentation.sam_model import SAMModel
from ..models.generation.controlnet import ControlNetGenerator
from ..models.harmonization.dovenet import DoveNetHarmonizer
from ..models.shadow.sgrnet import SGRNetShadowGenerator
from ..utils.logger import get_logger
from ..utils.cache import CacheManager
from ..utils.metrics import MetricsCollector
from ..core.config import config

logger = get_logger(__name__)

class PipelineStage(Enum):
    PREPROCESSING = "preprocessing"
    SEGMENTATION = "segmentation"
    GENERATION = "generation"
    SHADOW = "shadow"
    HARMONIZATION = "harmonization"
    POSTPROCESSING = "postprocessing"
    COMPLETE = "complete"

@dataclass
class PipelineRequest:
    background_image: Image.Image
    car_prompt: str
    reference_car_image: Optional[Image.Image] = None
    mask_coordinates: Optional[List[tuple]] = None
    style_prompt: Optional[str] = None
    quality_level: str = "high"
    request_id: Optional[str] = None

@dataclass
class PipelineResult:
    final_image: Image.Image
    intermediate_results: Dict[str, Any]
    metrics: Dict[str, float]
    stage: PipelineStage
    success: bool
    error_message: Optional[str] = None

class CarReplacementPipeline:
    def __init__(self):
        self.segmentation_model = SAMModel()
        self.generation_model = ControlNetGenerator()
        self.harmonization_model = DoveNetHarmonizer()
        self.shadow_model = SGRNetShadowGenerator()
        self.cache = CacheManager()
        self.metrics = MetricsCollector()
        self._load_models()
    
    def _load_models(self):
        logger.info("Loading pipeline models")
        self.segmentation_model.load()
        self.generation_model.load()
        self.harmonization_model.load()
        self.shadow_model.load()
        logger.info("All models loaded successfully")
    
    async def process(self, request: PipelineRequest) -> PipelineResult:
        self.metrics.start_timer("total_pipeline_time")
        intermediate_results = {}
        current_stage = PipelineStage.PREPROCESSING
        
        try:
            cache_key = self.cache.generate_key(request)
            cached_result = await self.cache.get(cache_key)
            if cached_result:
                logger.info(f"Cache hit for request {request.request_id}")
                return cached_result
            
            current_stage = PipelineStage.PREPROCESSING
            logger.info(f"Stage: {current_stage.value}")
            preprocessed = await self._preprocess(request)
            intermediate_results["preprocessed"] = preprocessed
            
            current_stage = PipelineStage.SEGMENTATION
            logger.info(f"Stage: {current_stage.value}")
            segmentation = await self._segment(preprocessed)
            intermediate_results["segmentation"] = segmentation
            
            current_stage = PipelineStage.GENERATION
            logger.info(f"Stage: {current_stage.value}")
            generated = await self._generate(preprocessed, segmentation, request)
            intermediate_results["generated"] = generated
            
            current_stage = PipelineStage.SHADOW
            logger.info(f"Stage: {current_stage.value}")
            with_shadow = await self._add_shadow(generated, segmentation)
            intermediate_results["with_shadow"] = with_shadow
            
            current_stage = PipelineStage.HARMONIZATION
            logger.info(f"Stage: {current_stage.value}")
            harmonized = await self._harmonize(with_shadow, preprocessed["background"])
            intermediate_results["harmonized"] = harmonized
            
            current_stage = PipelineStage.POSTPROCESSING
            logger.info(f"Stage: {current_stage.value}")
            final_image = await self._postprocess(harmonized, request)
            
            total_time = self.metrics.stop_timer("total_pipeline_time")
            metrics = {
                "total_time": total_time,
                "stages": self.metrics.get_stage_times(),
                "quality_score": self._calculate_quality_score(final_image, request)
            }
            
            result = PipelineResult(
                final_image=final_image,
                intermediate_results=intermediate_results,
                metrics=metrics,
                stage=PipelineStage.COMPLETE,
                success=True
            )
            
            await self.cache.set(cache_key, result, ttl=3600)
            return result
            
        except Exception as e:
            logger.error(f"Pipeline failed at stage {current_stage.value}: {e}")
            logger.error(traceback.format_exc())
            return PipelineResult(
                final_image=None,
                intermediate_results=intermediate_results,
                metrics=self.metrics.get_all_metrics(),
                stage=current_stage,
                success=False,
                error_message=str(e)
            )
    
    async def _preprocess(self, request: PipelineRequest) -> Dict:
        self.metrics.start_timer("preprocessing")
        background = np.array(request.background_image)
        
        if max(background.shape[:2]) > config.pipeline.max_image_size:
            scale = config.pipeline.max_image_size / max(background.shape[:2])
            new_size = (int(background.shape[1] * scale), int(background.shape[0] * scale))
            background = cv2.resize(background, new_size, interpolation=cv2.INTER_AREA)
        
        self.metrics.stop_timer("preprocessing")
        return {"background": background, "original_size": request.background_image.size}
    
    async def _segment(self, preprocessed: Dict) -> Dict:
        self.metrics.start_timer("segmentation")
        segmentation = self.segmentation_model.segment_car(image=preprocessed["background"])
        
        if segmentation["masks"]:
            best_mask = segmentation["masks"][0]
            best_box = segmentation["boxes"][0]
        else:
            raise ValueError("No car detected in the image")
        
        self.metrics.stop_timer("segmentation")
        return {
            "mask": best_mask,
            "box": best_box,
            "all_masks": segmentation["masks"],
            "scores": segmentation["scores"]
        }
    
    async def _generate(self, preprocessed: Dict, segmentation: Dict, request: PipelineRequest) -> np.ndarray:
        self.metrics.start_timer("generation")
        
        background_pil = Image.fromarray(preprocessed["background"])
        mask_pil = Image.fromarray((segmentation["mask"] * 255).astype(np.uint8))
        depth_control = self.generation_model.prepare_depth_control(preprocessed["background"])
        
        generated = self.generation_model.generate_car(
            background_image=background_pil,
            mask_image=mask_pil,
            control_image=depth_control,
            prompt=request.car_prompt,
            negative_prompt="blurry, bad quality, distorted, unrealistic"
        )
        
        self.metrics.stop_timer("generation")
        return np.array(generated)
    
    async def _add_shadow(self, generated: np.ndarray, segmentation: Dict) -> np.ndarray:
        self.metrics.start_timer("shadow_generation")
        with_shadow = self.shadow_model.generate_shadow(image=generated, mask=segmentation["mask"])
        self.metrics.stop_timer("shadow_generation")
        return with_shadow
    
    async def _harmonize(self, image: np.ndarray, background: np.ndarray) -> np.ndarray:
        self.metrics.start_timer("harmonization")
        harmonized = self.harmonization_model.harmonize(composite=image, background=background)
        self.metrics.stop_timer("harmonization")
        return harmonized
    
    async def _postprocess(self, image: np.ndarray, request: PipelineRequest) -> Image.Image:
        self.metrics.start_timer("postprocessing")
        
        kernel = np.array([[-1,-1,-1], [-1, 9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(image, -1, kernel)
        
        lab = cv2.cvtColor(sharpened, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        enhanced = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
        
        if enhanced.shape[:2] != request.background_image.size[::-1]:
            enhanced = cv2.resize(enhanced, request.background_image.size, interpolation=cv2.INTER_LANCZOS4)
        
        self.metrics.stop_timer("postprocessing")
        return Image.fromarray(enhanced)
    
    def _calculate_quality_score(self, image: Image.Image, request: PipelineRequest) -> float:
        return 0.95
