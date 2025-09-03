# scripts/prepare_compcars.py
import os
import json
from pathlib import Path

class CompCarsProcessor:
    def __init__(self, compcars_root):
        self.root = Path(compcars_root)
        self.image_dir = self.root / "data" / "image"
        self.label_dir = self.root / "data" / "label"
    
    def get_train_test_split(self):
        # Load official train/test split
        train_file = self.root / "data" / "train_test_split" / "classification" / "train.txt"
        test_file = self.root / "data" / "train_test_split" / "classification" / "test.txt"
        
        with open(train_file) as f:
            train_images = [line.strip() for line in f]
        
        with open(test_file) as f:
            test_images = [line.strip() for line in f]
            
        return train_images, test_images
    
    def create_yolo_dataset(self, output_dir):
        """Convert CompCars to YOLO format for fine-tuning"""
        train_images, test_images = self.get_train_test_split()
        
        # Create YOLO directory structure
        yolo_dir = Path(output_dir)
        (yolo_dir / "images" / "train").mkdir(parents=True, exist_ok=True)
        (yolo_dir / "images" / "val").mkdir(parents=True, exist_ok=True)
        (yolo_dir / "labels" / "train").mkdir(parents=True, exist_ok=True)
        (yolo_dir / "labels" / "val").mkdir(parents=True, exist_ok=True)
        
        # Process train and validation sets
        self._process_split(train_images, yolo_dir / "images" / "train", 
                           yolo_dir / "labels" / "train")
        self._process_split(test_images, yolo_dir / "images" / "val", 
                           yolo_dir / "labels" / "val")