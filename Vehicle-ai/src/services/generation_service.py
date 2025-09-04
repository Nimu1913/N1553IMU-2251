import asyncio
import pika
import json
from ..models.generation.controlnet import ControlNetGenerator
from ..utils.logger import get_logger
from ..core.config import config

logger = get_logger(__name__)

class GenerationService:
    def __init__(self):
        self.model = ControlNetGenerator()
        self.model.load()
        self.setup_rabbitmq()
    
    def setup_rabbitmq(self):
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=config.service.rabbitmq_host)
        )
        self.channel = connection.channel()
        self.channel.queue_declare(queue='generation')
    
    def run(self):
        logger.info("Generation service started")
        self.channel.start_consuming()

if __name__ == "__main__":
    service = GenerationService()
    service.run()
