import numpy as np
from typing import Any, Dict, List
import tritonclient.grpc as grpcclient
from ..core.config import config
from ..utils.logger import get_logger

logger = get_logger(__name__)

class TritonClient:
    def __init__(self):
        self.url = config.service.triton_url
        self.client = None
        self.connect()
    
    def connect(self):
        try:
            self.client = grpcclient.InferenceServerClient(url=self.url)
            logger.info(f"Connected to Triton server at {self.url}")
        except Exception as e:
            logger.error(f"Failed to connect to Triton: {e}")
            raise
    
    def infer(self, model_name: str, inputs: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        infer_inputs = []
        for name, data in inputs.items():
            infer_input = grpcclient.InferInput(name, data.shape, "FP32")
            infer_input.set_data_from_numpy(data)
            infer_inputs.append(infer_input)
        
        result = self.client.infer(model_name, infer_inputs)
        outputs = {}
        for output_name in result.get_output_names():
            outputs[output_name] = result.as_numpy(output_name)
        
        return outputs
