# src/composition/lighting_matcher.py
import cv2
import numpy as np

class LightingMatcher:
    def match_lighting(self, vehicle_img, background_img, mask):
        # Extract average color temperature from background
        bg_lab = cv2.cvtColor(background_img, cv2.COLOR_BGR2LAB)
        bg_mean_a = np.mean(bg_lab[:,:,1])
        bg_mean_b = np.mean(bg_lab[:,:,2])
        
        # Adjust vehicle lighting to match
        vehicle_lab = cv2.cvtColor(vehicle_img, cv2.COLOR_BGR2LAB)
        vehicle_lab[:,:,1] = np.clip(vehicle_lab[:,:,1] + (bg_mean_a - 128), 0, 255)
        vehicle_lab[:,:,2] = np.clip(vehicle_lab[:,:,2] + (bg_mean_b - 128), 0, 255)
        
        return cv2.cvtColor(vehicle_lab, cv2.COLOR_LAB2BGR)