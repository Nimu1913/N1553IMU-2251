import cv2
import numpy as np

class MaskRefiner:
    def refine_mask(self, mask, original_img=None):
        """
        Refine mask using morphological operations
        
        Args:
            mask: segmentation mask
            original_img: original image (optional, for compatibility)
        """
        try:
            # Ensure binary mask
            binary_mask = (mask > 0.5).astype(np.uint8)
            
            # Define kernels
            small_kernel = np.ones((3, 3), np.uint8)
            large_kernel = np.ones((5, 5), np.uint8)
            
            # Remove small noise
            cleaned = cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN, small_kernel)
            
            # Fill small holes
            filled = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, large_kernel)
            
            # Smooth edges
            smoothed = cv2.GaussianBlur(filled.astype(np.float32), (3, 3), 0)
            
            return smoothed
            
        except Exception as e:
            print(f"Error in mask refinement: {str(e)}")
            return mask
