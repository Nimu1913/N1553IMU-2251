class VehicleAIException(Exception):
    pass

class ModelLoadError(VehicleAIException):
    pass

class SegmentationError(VehicleAIException):
    pass

class GenerationError(VehicleAIException):
    pass

class HarmonizationError(VehicleAIException):
    pass

class ShadowGenerationError(VehicleAIException):
    pass

class InvalidInputError(VehicleAIException):
    pass
