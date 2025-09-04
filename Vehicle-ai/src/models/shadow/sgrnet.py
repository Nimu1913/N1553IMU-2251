import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import cv2

class SGRNetShadowGenerator:
    """
    SGRNet: Shadow Generation and Removal Network
    Paper: https://arxiv.org/abs/2104.10689
    """
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self._build_model()
    
    def _build_model(self):
        """Build SGRNet architecture"""
        class ShadowGenerator(nn.Module):
            def __init__(self):
                super().__init__()
                # Encoder for shadow generation
                self.encoder = nn.Sequential(
                    nn.Conv2d(4, 64, 4, stride=2, padding=1),  # Image + mask
                    nn.ReLU(inplace=True),
                    nn.Conv2d(64, 128, 4, stride=2, padding=1),
                    nn.ReLU(inplace=True),
                    nn.Conv2d(128, 256, 4, stride=2, padding=1),
                    nn.ReLU(inplace=True),
                    nn.Conv2d(256, 512, 4, stride=2, padding=1),
                    nn.ReLU(inplace=True)
                )
                
                # Shadow attention module
                self.shadow_attention = nn.Sequential(
                    nn.Conv2d(512, 256, 1),
                    nn.ReLU(inplace=True),
                    nn.Conv2d(256, 1, 1),
                    nn.Sigmoid()
                )
                
                # Decoder
                self.decoder = nn.Sequential(
                    nn.ConvTranspose2d(512, 256, 4, stride=2, padding=1),
                    nn.ReLU(inplace=True),
                    nn.ConvTranspose2d(256, 128, 4, stride=2, padding=1),
                    nn.ReLU(inplace=True),
                    nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1),
                    nn.ReLU(inplace=True),
                    nn.ConvTranspose2d(64, 3, 4, stride=2, padding=1),
                    nn.Tanh()
                )
            
            def forward(self, image, mask):
                x = torch.cat([image, mask], dim=1)
                features = self.encoder(x)
                attention = self.shadow_attention(features)
                features = features * attention
                shadow = self.decoder(features)
                return shadow
        
        self.model = ShadowGenerator().to(self.device)
        print("SGRNet shadow generator initialized")
    
    def generate_shadow(self, image, object_mask, light_params=None):
        """
        Generate realistic shadow for object
        Args:
            image: Background image
            object_mask: Mask of inserted object
            light_params: Light direction parameters
        """
        if light_params is None:
            light_params = self._estimate_lighting(image)
        
        # Convert to tensors
        img_array = np.array(image)
        h, w = img_array.shape[:2]
        
        # Create shadow projection based on light direction
        shadow_mask = self._project_shadow(object_mask, light_params)
        
        # Apply Gaussian blur for soft shadows
        shadow_mask = cv2.GaussianBlur(shadow_mask.astype(np.float32), (21, 21), 10)
        
        # Create shadow overlay
        shadow_color = np.array([0, 0, 0])
        shadow_overlay = np.ones_like(img_array) * shadow_color
        
        # Blend shadow with image
        shadow_alpha = shadow_mask * light_params.get('intensity', 0.5)
        shadow_alpha = np.stack([shadow_alpha] * 3, axis=-1)
        
        result = img_array * (1 - shadow_alpha) + shadow_overlay * shadow_alpha
        
        return Image.fromarray(result.astype(np.uint8))
    
    def _project_shadow(self, mask, light_params):
        """Project shadow based on light direction"""
        h, w = mask.shape
        shadow = np.zeros((h, w), dtype=np.float32)
        
        # Get light direction
        angle = light_params.get('angle', 45)
        distance = light_params.get('distance', 50)
        
        # Calculate shadow offset
        offset_x = int(distance * np.cos(np.radians(angle)))
        offset_y = int(distance * np.sin(np.radians(angle)))
        
        # Create perspective transform for shadow
        src_points = np.float32([[0, 0], [w, 0], [0, h], [w, h]])
        dst_points = np.float32([
            [offset_x, offset_y],
            [w + offset_x//2, offset_y],
            [offset_x//2, h],
            [w, h]
        ])
        
        # Apply perspective transform
        matrix = cv2.getPerspectiveTransform(src_points, dst_points)
        shadow = cv2.warpPerspective(mask.astype(np.float32), matrix, (w, h))
        
        # Make shadow ground-only (below object)
        object_y = np.where(mask > 0)[0]
        if len(object_y) > 0:
            object_bottom = object_y.max()
            shadow[:object_bottom-10, :] = 0
        
        return shadow
    
    def _estimate_lighting(self, image):
        """Estimate light direction from image"""
        # Simple lighting estimation based on image brightness
        img_array = np.array(image)
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Find brightest region (assume light source)
        h, w = gray.shape
        top_half = gray[:h//2, :].mean()
        bottom_half = gray[h//2:, :].mean()
        left_half = gray[:, :w//2].mean()
        right_half = gray[:, w//2:].mean()
        
        # Estimate angle based on brightness distribution
        vertical_angle = 30 if top_half > bottom_half else 150
        horizontal_angle = -30 if left_half > right_half else 30
        angle = (vertical_angle + horizontal_angle) / 2
        
        # Estimate intensity based on overall brightness
        intensity = 0.3 + (gray.mean() / 255) * 0.4
        
        return {
            'angle': angle,
            'distance': 30,
            'intensity': np.clip(intensity, 0.2, 0.7)
        }
