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
