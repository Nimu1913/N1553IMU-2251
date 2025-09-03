# scripts/train_custom_model.py
from ultralytics import YOLO

def train_vehicle_segmentation():
    # Load pre-trained model
    model = YOLO('yolov8n-seg.pt')
    
    # Create YAML config for CompCars
    config = """
path: ./data/compcars_yolo
train: images/train
val: images/val

nc: 1  # number of classes
names: ['vehicle']  # class names
"""
    
    with open('compcars.yaml', 'w') as f:
        f.write(config)
    
    # Train the model
    results = model.train(
        data='compcars.yaml',
        epochs=100,
        imgsz=640,
        device='cuda' if torch.cuda.is_available() else 'cpu',
        project='runs/segment',
        name='compcars_vehicle'
    )
    
    return results

if __name__ == "__main__":
    train_vehicle_segmentation()