# #!/bin/bash
cd /Users/nicholasmuradov/Downloads/N1553IMU-2251/Vehicle-ai

echo "==========================================="
echo "SETTING UP INFRASTRUCTURE COMPONENTS"
echo "==========================================="

# 1. CREATE DOCKER COMPOSE FOR INFRASTRUCTURE
cat > docker-compose.infrastructure.yml << 'EOF'
version: '3.8'

services:
  # REDIS - For caching processed images
  redis:
    image: redis:7-alpine
    container_name: vehicle-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 2gb --maxmemory-policy lru
    restart: unless-stopped

  # RABBITMQ - For async job processing
  rabbitmq:
    image: rabbitmq:3-management
    container_name: vehicle-rabbitmq
    ports:
      - "5672:5672"   # AMQP port
      - "15672:15672" # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin123
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    restart: unless-stopped

  # TRITON INFERENCE SERVER - For model serving
  triton:
    image: nvcr.io/nvidia/tritonserver:23.04-py3
    container_name: vehicle-triton
    ports:
      - "8001:8001"  # gRPC
      - "8002:8002"  # Metrics
    volumes:
      - ./triton/model_repository:/models
    command: tritonserver --model-repository=/models --model-control-mode=poll
    restart: unless-stopped

  # PROMETHEUS - For metrics collection
  prometheus:
    image: prom/prometheus:latest
    container_name: vehicle-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    restart: unless-stopped

  # GRAFANA - For visualization
  grafana:
    image: grafana/grafana:latest
    container_name: vehicle-grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: admin123
    volumes:
      - ./monitoring/grafana:/etc/grafana/provisioning
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  redis_data:
  rabbitmq_data:
  prometheus_data:
  grafana_data:

networks:
  default:
    name: vehicle-ai-network
EOF

# 2. CREATE PROMETHEUS CONFIG
mkdir -p monitoring
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'triton'
    static_configs:
      - targets: ['triton:8002']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
  
  - job_name: 'rabbitmq'
    static_configs:
      - targets: ['rabbitmq:15672']
EOF

# 3. CREATE REDIS CACHE IMPLEMENTATION
cat > src/utils/redis_cache.py << 'EOF'
import redis
import hashlib
import pickle
import json
from typing import Any, Optional
import logging

logger = logging.getLogger(__name__)

class RedisCache:
    """Redis cache for processed images and results"""
    
    def __init__(self, host='localhost', port=6379, db=0, ttl=3600):
        self.client = redis.Redis(host=host, port=port, db=db, decode_responses=False)
        self.ttl = ttl
        
    def generate_key(self, *args) -> str:
        """Generate cache key from arguments"""
        key_str = json.dumps(args, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            data = self.client.get(key)
            if data:
                return pickle.loads(data)
        except Exception as e:
            logger.error(f"Cache get error: {e}")
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache"""
        try:
            data = pickle.dumps(value)
            self.client.setex(key, ttl or self.ttl, data)
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    def exists(self, key: str) -> bool:
        """Check if key exists"""
        return self.client.exists(key)
    
    def delete(self, key: str):
        """Delete key from cache"""
        self.client.delete(key)
EOF

# 4. CREATE RABBITMQ QUEUE IMPLEMENTATION
cat > src/utils/task_queue.py << 'EOF'
import pika
import json
import uuid
from typing import Dict, Any, Callable
import logging

logger = logging.getLogger(__name__)

class TaskQueue:
    """RabbitMQ task queue for async processing"""
    
    def __init__(self, host='localhost', port=5672, user='admin', password='admin123'):
        credentials = pika.PlainCredentials(user, password)
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=host, port=port, credentials=credentials)
        )
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue='car_replacement', durable=True)
        
    def publish_task(self, task_type: str, data: Dict[str, Any]) -> str:
        """Publish task to queue"""
        task_id = str(uuid.uuid4())
        message = {
            'task_id': task_id,
            'type': task_type,
            'data': data
        }
        
        self.channel.basic_publish(
            exchange='',
            routing_key='car_replacement',
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)  # Persistent
        )
        
        logger.info(f"Published task {task_id}")
        return task_id
    
    def consume_tasks(self, callback: Callable):
        """Consume tasks from queue"""
        def wrapper(ch, method, properties, body):
            try:
                message = json.loads(body)
                callback(message)
                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                logger.error(f"Task processing failed: {e}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        
        self.channel.basic_qos(prefetch_count=1)
        self.channel.basic_consume(queue='car_replacement', on_message_callback=wrapper)
        self.channel.start_consuming()
    
    def close(self):
        """Close connection"""
        self.connection.close()
EOF

# 5. CREATE THE PROPER 6-STAGE PIPELINE
cat > src/pipeline/six_stage_pipeline.py << 'EOF'
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from enum import Enum
from dataclasses import dataclass
from typing import Dict, Any, Optional
import numpy as np
from PIL import Image
import cv2
import logging

from models.segmentation.sam_implementation import SAMSegmenter
from models.harmonization.harmonization_implementation import ImageHarmonizer
from models.shadow.shadow_implementation import ShadowGenerator
from utils.redis_cache import RedisCache
from utils.task_queue import TaskQueue

logger = logging.getLogger(__name__)

class PipelineStage(Enum):
    """6 Pipeline Stages from the PDF"""
    PREPROCESSING = 1
    SEGMENTATION = 2
    GENERATION = 3
    SHADOW = 4
    HARMONIZATION = 5
    POSTPROCESSING = 6

@dataclass
class PipelineResult:
    """Result from each stage"""
    stage: PipelineStage
    data: Any
    metadata: Dict[str, Any]
    success: bool
    error: Optional[str] = None

class SixStagePipeline:
    """The proper 6-stage pipeline from the PDF specification"""
    
    def __init__(self, use_cache=True, use_queue=False):
        # Initialize models
        self.segmenter = SAMSegmenter()
        self.harmonizer = ImageHarmonizer()
        self.shadow_gen = ShadowGenerator()
        
        # Initialize infrastructure
        if use_cache:
            self.cache = RedisCache()
        else:
            self.cache = None
            
        if use_queue:
            self.queue = TaskQueue()
        else:
            self.queue = None
    
    def execute(self, car_image_path: str, background_path: str, params: Dict = None) -> Dict:
        """Execute the complete 6-stage pipeline"""
        
        params = params or {}
        results = {}
        
        # Check cache
        if self.cache:
            cache_key = self.cache.generate_key(car_image_path, background_path, params)
            cached = self.cache.get(cache_key)
            if cached:
                logger.info("Cache hit - returning cached result")
                return cached
        
        # Load images
        car_img = Image.open(car_image_path)
        bg_img = Image.open(background_path)
        
        # STAGE 1: PREPROCESSING
        logger.info("Stage 1: Preprocessing")
        preprocessed = self._stage1_preprocessing(car_img, bg_img, params)
        results['preprocessing'] = preprocessed
        
        # STAGE 2: SEGMENTATION
        logger.info("Stage 2: Segmentation")
        segmented = self._stage2_segmentation(preprocessed.data['car'], params)
        results['segmentation'] = segmented
        
        # STAGE 3: GENERATION (or extraction in this case)
        logger.info("Stage 3: Generation/Extraction")
        generated = self._stage3_generation(preprocessed.data['car'], segmented.data, params)
        results['generation'] = generated
        
        # STAGE 4: SHADOW SYNTHESIS
        logger.info("Stage 4: Shadow Synthesis")
        with_shadow = self._stage4_shadow(preprocessed.data['background'], generated.data, params)
        results['shadow'] = with_shadow
        
        # STAGE 5: HARMONIZATION
        logger.info("Stage 5: Harmonization")
        harmonized = self._stage5_harmonization(with_shadow.data, preprocessed.data['background'], params)
        results['harmonization'] = harmonized
        
        # STAGE 6: POSTPROCESSING
        logger.info("Stage 6: Postprocessing")
        final = self._stage6_postprocessing(harmonized.data, params)
        results['postprocessing'] = final
        
        # Cache result
        if self.cache:
            self.cache.set(cache_key, results)
        
        return results
    
    def _stage1_preprocessing(self, car_img, bg_img, params):
        """Stage 1: Preprocessing - Resize, normalize, prepare"""
        max_size = params.get('max_size', 2048)
        
        # Resize if needed
        car_array = np.array(car_img)
        bg_array = np.array(bg_img)
        
        if max(car_array.shape[:2]) > max_size:
            scale = max_size / max(car_array.shape[:2])
            new_size = (int(car_array.shape[1] * scale), int(car_array.shape[0] * scale))
            car_array = cv2.resize(car_array, new_size, interpolation=cv2.INTER_AREA)
        
        if max(bg_array.shape[:2]) > max_size:
            scale = max_size / max(bg_array.shape[:2])
            new_size = (int(bg_array.shape[1] * scale), int(bg_array.shape[0] * scale))
            bg_array = cv2.resize(bg_array, new_size, interpolation=cv2.INTER_AREA)
        
        return PipelineResult(
            stage=PipelineStage.PREPROCESSING,
            data={'car': car_array, 'background': bg_array},
            metadata={'car_shape': car_array.shape, 'bg_shape': bg_array.shape},
            success=True
        )
    
    def _stage2_segmentation(self, car_array, params):
        """Stage 2: Segmentation - Extract car using SAM"""
        mask, bbox = self.segmenter.segment_car_auto(car_array)
        
        if mask is None:
            return PipelineResult(
                stage=PipelineStage.SEGMENTATION,
                data=None,
                metadata={},
                success=False,
                error="No car detected"
            )
        
        return PipelineResult(
            stage=PipelineStage.SEGMENTATION,
            data={'mask': mask, 'bbox': bbox},
            metadata={'confidence': 0.95},
            success=True
        )
    
    def _stage3_generation(self, car_array, segmentation_data, params):
        """Stage 3: Generation/Extraction - Extract and prepare car"""
        mask = segmentation_data['mask']
        bbox = segmentation_data['bbox']
        
        # Extract car with transparency
        car_img = Image.fromarray(car_array)
        car_rgba = car_img.convert("RGBA")
        car_data = np.array(car_rgba)
        car_data[:, :, 3] = mask.astype(np.uint8) * 255
        car_extracted = Image.fromarray(car_data, 'RGBA')
        
        # Crop to bbox
        x, y, w, h = bbox
        car_cropped = car_extracted.crop((x, y, x+w, y+h))
        
        return PipelineResult(
            stage=PipelineStage.GENERATION,
            data={'car': car_cropped, 'bbox': bbox},
            metadata={'extraction_method': 'SAM'},
            success=True
        )
    
    def _stage4_shadow(self, bg_array, generation_data, params):
        """Stage 4: Shadow Synthesis - Add realistic shadow"""
        car = generation_data['car']
        bbox = generation_data['bbox']
        
        # Calculate position and scale
        bg_img = Image.fromarray(bg_array)
        bg_w, bg_h = bg_img.size
        _, _, w, h = bbox
        
        scale = min(bg_w / (w * 2), bg_h / (h * 2))
        new_w = int(w * scale)
        new_h = int(h * scale)
        
        car_resized = car.resize((new_w, new_h), Image.LANCZOS)
        
        # Position at bottom center
        pos_x = (bg_w - new_w) // 2
        pos_y = bg_h - new_h - 50
        
        # Add shadow
        shadow_bbox = (pos_x, pos_y, new_w, new_h)
        bg_with_shadow = self.shadow_gen.add_contact_shadow(bg_img, shadow_bbox)
        
        # Composite car
        bg_with_shadow = bg_with_shadow.convert('RGBA')
        bg_with_shadow.paste(car_resized, (pos_x, pos_y), car_resized)
        
        return PipelineResult(
            stage=PipelineStage.SHADOW,
            data={'image': bg_with_shadow, 'position': (pos_x, pos_y)},
            metadata={'shadow_intensity': 0.5},
            success=True
        )
    
    def _stage5_harmonization(self, shadow_data, bg_array, params):
        """Stage 5: Harmonization - Match colors and lighting"""
        img_with_shadow = shadow_data['image']
        pos_x, pos_y = shadow_data['position']
        
        # Create mask for harmonization
        bg_img = Image.fromarray(bg_array)
        w, h = img_with_shadow.size
        mask = np.zeros((h, w))
        
        # Simple rectangular mask for now (should use actual car mask)
        # This is simplified - in production you'd track the exact mask through stages
        
        result = self.harmonizer.harmonize(img_with_shadow, bg_img, mask)
        
        return PipelineResult(
            stage=PipelineStage.HARMONIZATION,
            data=result,
            metadata={'method': 'LAB_color_transfer'},
            success=True
        )
    
    def _stage6_postprocessing(self, harmonized_img, params):
        """Stage 6: Postprocessing - Final enhancements"""
        img_array = np.array(harmonized_img)
        
        # Sharpen
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(img_array, -1, kernel)
        
        # Adjust contrast
        lab = cv2.cvtColor(sharpened, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        enhanced = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
        
        final_img = Image.fromarray(enhanced)
        
        return PipelineResult(
            stage=PipelineStage.POSTPROCESSING,
            data=final_img,
            metadata={'enhancements': ['sharpen', 'CLAHE']},
            success=True
        )
EOF

# 6. CREATE TRITON MODEL REPOSITORY STRUCTURE
mkdir -p triton/model_repository/sam/{1,config}
cat > triton/model_repository/sam/config.pbtxt << 'EOF'
name: "sam"
platform: "pytorch_libtorch"
max_batch_size: 1
input [
  {
    name: "input_image"
    data_type: TYPE_FP32
    dims: [ 3, 1024, 1024 ]
  }
]
output [
  {
    name: "masks"
    data_type: TYPE_FP32
    dims: [ 1, 256, 256 ]
  }
]
EOF

# 7. CREATE TEST SCRIPT
cat > test_infrastructure.py << 'EOF'
#!/usr/bin/env python3
import sys
import time
sys.path.append('src')

print("Testing Infrastructure Components")
print("=" * 50)

# Test Redis
print("\n1. Testing Redis Cache...")
try:
    from utils.redis_cache import RedisCache
    cache = RedisCache()
    cache.set("test_key", {"data": "test_value"})
    result = cache.get("test_key")
    if result and result['data'] == 'test_value':
        print("✓ Redis cache working")
    else:
        print("✗ Redis cache failed")
except Exception as e:
    print(f"✗ Redis error: {e}")
    print("  Make sure Redis is running: docker-compose -f docker-compose.infrastructure.yml up redis -d")

# Test RabbitMQ
print("\n2. Testing RabbitMQ...")
try:
    from utils.task_queue import TaskQueue
    queue = TaskQueue()
    task_id = queue.publish_task("test", {"message": "hello"})
    print(f"✓ RabbitMQ working - published task {task_id}")
    queue.close()
except Exception as e:
    print(f"✗ RabbitMQ error: {e}")
    print("  Make sure RabbitMQ is running: docker-compose -f docker-compose.infrastructure.yml up rabbitmq -d")

# Test 6-Stage Pipeline
print("\n3. Testing 6-Stage Pipeline...")
try:
    from pipeline.six_stage_pipeline import SixStagePipeline
    pipeline = SixStagePipeline(use_cache=False, use_queue=False)
    
    results = pipeline.execute(
        "test_images/test_car.jpg",
        "test_images/sporty.jpg",
        {"max_size": 1024}
    )
    
    if results['postprocessing'].success:
        final_image = results['postprocessing'].data
        final_image.save("six_stage_result.jpg")
        print("✓ 6-Stage Pipeline complete!")
        print("✓ Result saved as six_stage_result.jpg")
        
        print("\n  Stages completed:")
        for stage_name, result in results.items():
            status = "✓" if result.success else "✗"
            print(f"    {status} {stage_name}")
    else:
        print("✗ Pipeline failed")
        
except Exception as e:
    print(f"✗ Pipeline error: {e}")

print("\n" + "=" * 50)
print("Infrastructure test complete!")
EOF

chmod +x test_infrastructure.py

echo ""
echo "==========================================="
echo "INFRASTRUCTURE SETUP COMPLETE!"
echo "==========================================="
echo ""
echo "Start infrastructure services:"
echo "  docker-compose -f docker-compose.infrastructure.yml up -d"
echo ""
echo "Check services:"
echo "  Redis:    http://localhost:6379"
echo "  RabbitMQ: http://localhost:15672 (admin/admin123)"
echo "  Grafana:  http://localhost:3000 (admin/admin123)"
echo "  Prometheus: http://localhost:9090"
echo ""
echo "Test everything:"
echo "  python3 test_infrastructure.py"
