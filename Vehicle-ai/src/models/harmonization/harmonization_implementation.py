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
