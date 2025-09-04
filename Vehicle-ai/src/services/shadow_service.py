from ..models.shadow.sgrnet import SGRNetShadowGenerator
from ..utils.logger import get_logger

logger = get_logger(__name__)

class ShadowService:
    def __init__(self):
        self.model = SGRNetShadowGenerator()
        self.model.load()
    
    def run(self):
        logger.info("Shadow service started")

if __name__ == "__main__":
    service = ShadowService()
    service.run()
