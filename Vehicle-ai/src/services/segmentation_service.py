import asyncio
import pika
import json
from ..models.segmentation.sam_model import SAMModel
from ..utils.logger import get_logger
from ..core.config import config

logger = get_logger(__name__)

class SegmentationService:
    def __init__(self):
        self.model = SAMModel()
        self.model.load()
        self.setup_rabbitmq()
    
    def setup_rabbitmq(self):
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=config.service.rabbitmq_host)
        )
        self.channel = connection.channel()
        self.channel.queue_declare(queue='segmentation')
    
    def process_message(self, ch, method, properties, body):
        try:
            data = json.loads(body)
            result = self.model.segment_car(data['image'])
            ch.basic_publish(
                exchange='',
                routing_key=properties.reply_to,
                body=json.dumps(result)
            )
        except Exception as e:
            logger.error(f"Processing failed: {e}")
    
    def run(self):
        self.channel.basic_consume(
            queue='segmentation',
            on_message_callback=self.process_message,
            auto_ack=True
        )
        logger.info("Segmentation service started")
        self.channel.start_consuming()

if __name__ == "__main__":
    service = SegmentationService()
    service.run()
