#!/bin/bash
set -e

MODELS_DIR="models/weights"
mkdir -p ${MODELS_DIR}/{sam,controlnet,stable_diffusion,harmonization,shadow}

echo "Starting model downloads using curl..."

echo "Downloading SAM model (2.4GB)..."
if [ ! -f "${MODELS_DIR}/sam/sam_vit_h_4b8939.pth" ]; then
    curl -L --progress-bar \
        https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth \
        -o ${MODELS_DIR}/sam/sam_vit_h_4b8939.pth
else
    echo "SAM model already exists, skipping..."
fi

echo ""
echo "Downloading ControlNet model (1.4GB)..."
if [ ! -f "${MODELS_DIR}/controlnet/control_v11f1p_sd15_depth.pth" ]; then
    curl -L --progress-bar \
        https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11f1p_sd15_depth.pth \
        -o ${MODELS_DIR}/controlnet/control_v11f1p_sd15_depth.pth
else
    echo "ControlNet model already exists, skipping..."
fi

echo ""
echo "Note: Stable Diffusion model requires Python huggingface-hub"
echo "Install it first with: pip install huggingface-hub"
echo ""
echo "Models downloaded to: ${MODELS_DIR}"
echo "Total size: $(du -sh ${MODELS_DIR} 2>/dev/null | cut -f1 || echo 'Unknown')"
