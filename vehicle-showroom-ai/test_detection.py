from ultralytics import YOLO
import cv2

model = YOLO('runs/detect/vehicle_quick/weights/best.pt')
results = model('data/input/car1.jpg', conf=0.75)  # Higher confidence threshold

# Get only the largest detection (main car)
if results[0].boxes:
    boxes = results[0].boxes
    areas = [(box.xyxy[0][2] - box.xyxy[0][0]) * (box.xyxy[0][3] - box.xyxy[0][1]) for box in boxes]
    main_car_idx = areas.index(max(areas))
    
    main_box = boxes[main_car_idx]
    print(f'Main vehicle: {float(main_box.conf[0]):.2%} confidence')
    
    # Crop to just the main car
    x1, y1, x2, y2 = map(int, main_box.xyxy[0])
    img = cv2.imread('data/input/car1.jpg')
    car_cropped = img[y1:y2, x1:x2]
    cv2.imwrite('main_car.jpg', car_cropped)
    print('Saved cropped car to main_car.jpg')
