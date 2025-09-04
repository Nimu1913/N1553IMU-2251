#!/usr/bin/env python3
# scripts/train_custom_model.py - Fixed version with proper imports

import os
import sys
import argparse
from pathlib import Path

# Import with error handling
try:
    import torch
except ImportError:
    print("❌ PyTorch not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio"])
    import torch

try:
    from ultralytics import YOLO
except ImportError:
    print("❌ Ultralytics not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "ultralytics"])
    from ultralytics import YOLO

def train_vehicle_segmentation():
    """Original function from your code, now with imports fixed"""
    
    # Check device availability
    if torch.cuda.is_available():
        device = 'cuda'
        print(f"🎮 Using CUDA: {torch.cuda.get_device_name(0)}")
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        device = 'mps'
        print("🎮 Using Apple Silicon MPS")
    else:
        device = 'cpu'
        print("💻 Using CPU")
    
    # Load pre-trained model
    print("📦 Loading YOLOv8 model...")
    model = YOLO('yolov8n-seg.pt')
    
    # Create YAML config for CompCars
    config = """
path: ./data/compcars_yolo
train: images/train
val: images/val

nc: 1  # number of classes
names: ['vehicle']  # class names
"""
    
    # Check if config exists, if not create it
    config_path = Path('compcars.yaml')
    if not config_path.exists():
        with open('compcars.yaml', 'w') as f:
            f.write(config)
        print(f"✅ Created config: {config_path}")
    
    # Check if dataset exists
    data_path = Path('./data/compcars_yolo/dataset.yaml')
    if data_path.exists():
        config_file = str(data_path)
        print(f"📊 Using existing dataset config: {config_file}")
    else:
        config_file = 'compcars.yaml'
        print(f"📊 Using config: {config_file}")
    
    # Train the model
    print("\n🚀 Starting training...")
    results = model.train(
        data=config_file,
        epochs=100,
        imgsz=640,
        batch=16 if device != 'cpu' else 4,
        device=device,
        project='runs/segment',
        name='compcars_vehicle',
        patience=50,
        save=True,
        plots=True,
        verbose=True
    )
    
    print("\n✅ Training complete!")
    return results

def main():
    """Main function with argument parsing"""
    parser = argparse.ArgumentParser(description='Train custom vehicle model')
    parser.add_argument('--data', help='Path to dataset.yaml')
    parser.add_argument('--epochs', type=int, default=100, help='Number of epochs')
    parser.add_argument('--batch', type=int, default=16, help='Batch size')
    parser.add_argument('--imgsz', type=int, default=640, help='Image size')
    parser.add_argument('--model', default='yolov8n-seg.pt', help='Base model')
    
    args = parser.parse_args()
    
    # Check device
    if torch.cuda.is_available():
        device = 'cuda'
        print(f"🎮 Using CUDA: {torch.cuda.get_device_name(0)}")
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        device = 'mps'
        print("🎮 Using Apple Silicon MPS")
    else:
        device = 'cpu'
        print("💻 Using CPU")
    
    # Load model
    print(f"\n📦 Loading model: {args.model}")
    model = YOLO(args.model)
    
    # Use provided data or default
    if args.data:
        data_yaml = args.data
    else:
        # Look for dataset in expected location
        if Path('./data/compcars_yolo/dataset.yaml').exists():
            data_yaml = './data/compcars_yolo/dataset.yaml'
        else:
            print("❌ No dataset found. Please run prepare_compcars.py first")
            print("\nExample command:")
            print("python scripts/prepare_compcars.py \\")
            print("  --compcars-root /Users/nicholasmuradov/Downloads/dealership-backend/compcar \\")
            print("  --output-dir ./data/compcars_yolo \\")
            print("  --max-train 1000 --max-val 200 --partial")
            return
    
    print(f"📊 Training with dataset: {data_yaml}")
    print(f"⚙️  Settings: {args.epochs} epochs, batch={args.batch}, image={args.imgsz}px")
    
    # Train the model
    print("\n🚀 Starting training...")
    results = model.train(
        data=data_yaml,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch if device != 'cpu' else min(args.batch, 4),
        device=device,
        project='runs/segment',
        name='vehicle_custom',
        patience=50,
        save=True,
        save_period=10,
        plots=True,
        verbose=True,
        
        # Optimization settings
        optimizer='AdamW',
        lr0=0.01,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        
        # Augmentation
        degrees=10.0,
        translate=0.1,
        scale=0.5,
        shear=5.0,
        flipud=0.0,
        fliplr=0.5,
        mosaic=1.0,
        
        # Performance
        amp=True if device != 'cpu' else False,
    )
    
    print("\n✅ Training complete!")
    
    # Save best model to models directory
    best_model = Path(f'runs/segment/vehicle_custom/weights/best.pt')
    if best_model.exists():
        models_dir = Path('models')
        models_dir.mkdir(exist_ok=True)
        
        import shutil
        save_path = models_dir / 'vehicle_seg_custom.pt'
        shutil.copy(best_model, save_path)
        
        print(f"📦 Best model saved to: {save_path}")
        print(f"\n🎯 Use your trained model:")
        print(f"python scripts/process_vehicle_refined.py \\")
        print(f"  --input data/input/test_car.jpg \\")
        print(f"  --background data/backgrounds/showroom1.jpg \\")
        print(f"  --output data/output/result.jpg \\")
        print(f"  --model {save_path}")
    
    return results

if __name__ == "__main__":
    # If no arguments, run the original function for backward compatibility
    if len(sys.argv) == 1:
        print("⚠️  No arguments provided, running default training...")
        train_vehicle_segmentation()
    else:
        main()

        python3 -c "
import cv2
import numpy as np
from PIL import Image

