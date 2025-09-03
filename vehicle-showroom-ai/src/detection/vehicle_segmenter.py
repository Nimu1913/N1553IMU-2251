from ultralytics import YOLO
import cv2
import numpy as np
import logging

class VehicleSegmenter:
    def __init__(self, model_path='yolov8n-seg.pt'):
        self.model = YOLO(model_path)
        self.vehicle_classes = [2, 3, 5, 7]  # car, motorcycle, bus, truck
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def segment_vehicle(self, image_path, confidence_threshold=0.25):
        try:
            results = self.model(image_path, conf=confidence_threshold)
            
            masks = []
            boxes = []
            confidences = []
            class_ids = []
            
            for result in results:
                if result.masks is not None and result.boxes is not None:
                    for i, class_id in enumerate(result.boxes.cls):
                        if int(class_id) in self.vehicle_classes:
                            mask = result.masks.data[i].cpu().numpy()
                            box = result.boxes.xyxy[i].cpu().numpy()
                            conf = result.boxes.conf[i].cpu().numpy()
                            
                            masks.append(mask)
                            boxes.append(box)
                            confidences.append(conf)
                            class_ids.append(int(class_id))
                            
                            print(f"Found vehicle with confidence: {conf:.2f}")
            
            print(f"Total vehicles found: {len(masks)}")
            return masks, boxes, confidences, class_ids
            
        except Exception as e:
            print(f"Error in segmentation: {str(e)}")
            return [], [], [], []
    
    def get_best_mask(self, masks, boxes, confidences):
        if not masks:
            return None
        best_idx = np.argmax(confidences)
        return masks[best_idx]
