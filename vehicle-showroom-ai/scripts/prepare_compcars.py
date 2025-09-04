#!/usr/bin/env python3
# scripts/prepare_compcars.py
import os
import json
import shutil
import random
from pathlib import Path
import cv2
import numpy as np
from tqdm import tqdm

class CompCarsProcessor:
    def __init__(self, compcars_root, partial=True):
        """
        Args:
            compcars_root: Path to CompCars dataset
            partial: If True, work with partial dataset structure
        """
        self.root = Path(compcars_root)
        self.partial = partial
        
        # Check which structure exists
        if (self.root / "data" / "image").exists():
            # Full structure with data/ subdirectory
            self.image_dir = self.root / "data" / "image"
            self.label_dir = self.root / "data" / "label"
        elif (self.root / "image").exists():
            # Partial structure without data/ subdirectory
            self.image_dir = self.root / "image"
            self.label_dir = self.root / "label"
        else:
            # Try to find image directory
            print("⚠️  Standard structure not found, searching for images...")
            self.image_dir = self.root / "data" / "image"
            self.label_dir = self.root / "data" / "label"
            
        print(f"📁 CompCars root: {self.root}")
        print(f"📁 Image directory: {self.image_dir}")
        print(f"📁 Label directory: {self.label_dir}")
    
    def get_train_test_split(self, split_ratio=0.8):
        """Get train/test split from CompCars or create custom split"""
        
        # Try official split files first
        train_file = self.root / "train_test_split" / "classification" / "train.txt"
        test_file = self.root / "train_test_split" / "classification" / "test.txt"
        
        if train_file.exists() and test_file.exists():
            print("✅ Using official train/test split")
            with open(train_file) as f:
                train_images = [line.strip() for line in f]
            with open(test_file) as f:
                test_images = [line.strip() for line in f]
        else:
            print("⚠️ No official split found, creating custom split")
            # Create custom split from available images
            all_images = self.get_all_images()
            random.shuffle(all_images)
            
            split_idx = int(len(all_images) * split_ratio)
            train_images = all_images[:split_idx]
            test_images = all_images[split_idx:]
            
        print(f"📊 Train: {len(train_images)}, Test: {len(test_images)}")
        return train_images, test_images
    
    def get_all_images(self):
        """Get all available images from the dataset"""
        images = []
        
        if self.image_dir.exists():
            # Find ALL jpg files recursively, regardless of structure
            all_jpgs = list(self.image_dir.rglob("*.jpg"))
            
            # Convert to relative paths
            for img_file in all_jpgs:
                rel_path = img_file.relative_to(self.image_dir)
                images.append(str(rel_path))
            
            # Debug: show sample structure
            if images and len(images) > 0:
                print(f"   Sample image path: {images[0]}")
        
        print(f"📷 Found {len(images)} images")
        return images
    
    def parse_compcars_bbox(self, image_path):
        """Parse CompCars bounding box annotations"""
        # CompCars bbox format: x1, y1, x2, y2
        
        # Build label path from image path
        label_path = self.label_dir / image_path.replace('.jpg', '.txt')
        
        if not Path(label_path).exists():
            # If no label, use full image as bbox
            return None
        
        try:
            with open(label_path, 'r') as f:
                lines = f.readlines()
                if lines:
                    # CompCars format: viewpoint x1 y1 x2 y2
                    parts = lines[0].strip().split()
                    if len(parts) >= 5:
                        x1, y1, x2, y2 = map(int, parts[1:5])
                        return (x1, y1, x2, y2)
        except:
            pass
        
        return None
    
    def convert_to_yolo_format(self, bbox, img_width, img_height):
        """Convert bbox to YOLO format (normalized xywh)"""
        if bbox is None:
            # Use full image
            return "0 0.5 0.5 1.0 1.0"  # class x_center y_center width height
        
        x1, y1, x2, y2 = bbox
        
        # Calculate YOLO format
        x_center = (x1 + x2) / 2.0 / img_width
        y_center = (y1 + y2) / 2.0 / img_height
        width = (x2 - x1) / img_width
        height = (y2 - y1) / img_height
        
        # Class 0 for vehicle
        return f"0 {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}"
    
    def _process_split(self, image_list, img_output_dir, label_output_dir, max_samples=None):
        """Process a split of images"""
        img_output_dir = Path(img_output_dir)
        label_output_dir = Path(label_output_dir)
        
        # Limit samples if specified
        if max_samples:
            image_list = image_list[:max_samples]
        
        print(f"🔄 Processing {len(image_list)} images...")
        
        processed = 0
        skipped = 0
        
        for img_path in tqdm(image_list, desc="Processing"):
            try:
                # Full path to source image
                src_img = self.image_dir / img_path
                
                if not src_img.exists():
                    skipped += 1
                    continue
                
                # Read image to get dimensions
                img = cv2.imread(str(src_img))
                if img is None:
                    skipped += 1
                    continue
                    
                h, w = img.shape[:2]
                
                # Get bounding box
                bbox = self.parse_compcars_bbox(img_path)
                
                # Convert to YOLO format
                yolo_label = self.convert_to_yolo_format(bbox, w, h)
                
                # Create output filename (flatten directory structure)
                output_name = img_path.replace('/', '_').replace('\\', '_')
                
                # Copy image
                dst_img = img_output_dir / output_name
                shutil.copy2(src_img, dst_img)
                
                # Write YOLO label
                label_file = label_output_dir / output_name.replace('.jpg', '.txt')
                with open(label_file, 'w') as f:
                    f.write(yolo_label)
                
                processed += 1
                
            except Exception as e:
                print(f"⚠️ Error processing {img_path}: {e}")
                skipped += 1
        
        print(f"✅ Processed: {processed}, Skipped: {skipped}")
    
    def create_yolo_dataset(self, output_dir, max_train=5000, max_val=1000):
        """Convert CompCars to YOLO format for fine-tuning"""
        
        print(f"🚀 Creating YOLO dataset in: {output_dir}")
        
        train_images, test_images = self.get_train_test_split()
        
        # Create YOLO directory structure
        yolo_dir = Path(output_dir)
        (yolo_dir / "images" / "train").mkdir(parents=True, exist_ok=True)
        (yolo_dir / "images" / "val").mkdir(parents=True, exist_ok=True)
        (yolo_dir / "labels" / "train").mkdir(parents=True, exist_ok=True)
        (yolo_dir / "labels" / "val").mkdir(parents=True, exist_ok=True)
        
        # Process train and validation sets with limits
        print("\n📝 Processing training set...")
        self._process_split(train_images, 
                          yolo_dir / "images" / "train",
                          yolo_dir / "labels" / "train",
                          max_samples=max_train)
        
        print("\n📝 Processing validation set...")
        self._process_split(test_images, 
                          yolo_dir / "images" / "val",
                          yolo_dir / "labels" / "val",
                          max_samples=max_val)
        
        # Create dataset.yaml for YOLO
        yaml_content = f"""# CompCars dataset for vehicle segmentation
path: {yolo_dir.absolute()}
train: images/train
val: images/val

# Classes
nc: 1  # number of classes
names: ['vehicle']  # class names

# Training parameters (optional)
# batch: 16
# imgsz: 640
# epochs: 100
"""
        
        yaml_file = yolo_dir / "dataset.yaml"
        with open(yaml_file, 'w') as f:
            f.write(yaml_content)
        
        print(f"\n✅ Dataset created successfully!")
        print(f"📁 Location: {yolo_dir}")
        print(f"📄 Config: {yaml_file}")
        
        # Print statistics
        train_count = len(list((yolo_dir / "images" / "train").glob("*.jpg")))
        val_count = len(list((yolo_dir / "images" / "val").glob("*.jpg")))
        
        print(f"\n📊 Dataset Statistics:")
        print(f"  Training images: {train_count}")
        print(f"  Validation images: {val_count}")
        
        return str(yaml_file)

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Prepare CompCars dataset for YOLO training')
    parser.add_argument('--compcars-root', required=True, help='Path to CompCars dataset')
    parser.add_argument('--output-dir', default='./data/compcars_yolo', help='Output directory')
    parser.add_argument('--max-train', type=int, default=5000, help='Max training samples')
    parser.add_argument('--max-val', type=int, default=1000, help='Max validation samples')
    parser.add_argument('--partial', action='store_true', help='Using partial dataset')
    
    args = parser.parse_args()
    
    # Process CompCars
    processor = CompCarsProcessor(args.compcars_root, partial=args.partial)
    yaml_file = processor.create_yolo_dataset(
        args.output_dir,
        max_train=args.max_train,
        max_val=args.max_val
    )
    
    print(f"\n🎯 Next step: Train with")
    print(f"   python scripts/train_custom_model.py --data {yaml_file}")

if __name__ == "__main__":
    main()