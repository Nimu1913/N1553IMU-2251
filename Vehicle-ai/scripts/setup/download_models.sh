#!/bin/bash
set -e

MODELS_DIR="models/weights"
mkdir -p ${MODELS_DIR}/{sam,controlnet,stable_diffusion,harmonization,shadow}

echo "Starting model downloads..."

echo "Downloading SAM model..."
if [ ! -f "${MODELS_DIR}/sam/sam_vit_h_4b8939.pth" ]; then
    wget -q --show-progress \
        https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth \
        -O ${MODELS_DIR}/sam/sam_vit_h_4b8939.pth
fi

echo "Downloading ControlNet models..."
if [ ! -f "${MODELS_DIR}/controlnet/control_v11f1p_sd15_depth.pth" ]; then
    wget -q --show-progress \
        https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11f1p_sd15_depth.pth \
        -O ${MODELS_DIR}/controlnet/control_v11f1p_sd15_depth.pth
fi

echo "Downloading Stable Diffusion model..."
if [ ! -d "${MODELS_DIR}/stable_diffusion/stable-diffusion-v1-5" ]; then
    python3 -c "
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id='runwayml/stable-diffusion-v1-5',
    local_dir='${MODELS_DIR}/stable_diffusion/',
    local_dir_use_symlinks=False
)
"
fi

echo "All models downloaded successfully!"
echo "Total size: $(du -sh ${MODELS_DIR} | cut -f1)"
