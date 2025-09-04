import time
import numpy as np
from src.models.segmentation.sam_model import SAMModel

def benchmark_segmentation():
    model = SAMModel()
    model.load()
    
    times = []
    for _ in range(10):
        dummy_image = np.random.randint(0, 255, (1024, 768, 3), dtype=np.uint8)
        start = time.time()
        model.segment_car(dummy_image)
        times.append(time.time() - start)
    
    print(f"Average segmentation time: {np.mean(times):.3f}s")

if __name__ == "__main__":
    benchmark_segmentation()
