import pytest
from src.models.generation.controlnet import ControlNetGenerator

def test_controlnet_initialization():
    model = ControlNetGenerator()
    assert model is not None
