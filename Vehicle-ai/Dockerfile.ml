FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    git \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --no-cache-dir \
    torch==2.5.0 \
    torchvision==0.20.0 \
    numpy==1.26.4 \
    opencv-python-headless==4.10.0.84 \
    Pillow==10.4.0 \
    fastapi==0.115.6 \
    uvicorn==0.34.0 \
    python-multipart==0.0.6

RUN pip install git+https://github.com/facebookresearch/segment-anything.git

COPY models/weights/sam/ /app/models/weights/sam/
COPY src/ /app/src/

CMD ["python", "-m", "uvicorn", "src.api.car_insertion_fixed:app", "--host", "0.0.0.0", "--port", "8080"]
