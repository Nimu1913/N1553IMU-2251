from typing import Any

class OutputValidator:
    def validate(self, output: Any) -> bool:
        return output is not None
