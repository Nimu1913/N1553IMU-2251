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
