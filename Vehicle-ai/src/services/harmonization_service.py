from ..models.harmonization.dovenet import DoveNetHarmonizer
from ..utils.logger import get_logger

logger = get_logger(__name__)

class HarmonizationService:
    def __init__(self):
        self.model = DoveNetHarmonizer()
        self.model.load()
    
    def run(self):
        logger.info("Harmonization service started")

if __name__ == "__main__":
    service = HarmonizationService()
    service.run()
