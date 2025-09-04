# Vehicle AI - Photorealistic Car Replacement System

An advanced AI system for replacing cars in images with photorealistic quality using state-of-the-art computer vision models.

## Features
- SAM-based segmentation for precise car detection
- ControlNet + Stable Diffusion for realistic car generation
- Advanced harmonization for seamless integration
- Automatic shadow generation
- Microservice architecture with Docker/Kubernetes support

## Quick Start

1. Setup environment:
```bash
make setup
```

2. Download models:
```bash
make download-models
```

3. Build and run:
```bash
make build
make run
```

4. Test the API:
```bash
curl -X POST http://localhost:8080/api/v1/process \
  -H "Content-Type: multipart/form-data" \
  -F "background=@test_image.jpg" \
  -F "prompt=luxury red sports car"
```

## License
Proprietary - All rights reserved
