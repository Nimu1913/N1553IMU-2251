from typing import Any
from ...core.exceptions import InvalidInputError

class InputValidator:
    def validate(self, request: Any) -> bool:
        if not request.background_image:
            raise InvalidInputError("Background image is required")
        if not request.car_prompt:
            raise InvalidInputError("Car prompt is required")
        return True
