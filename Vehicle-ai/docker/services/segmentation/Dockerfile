FROM vehicle-ai/base:latest
COPY src/models/segmentation /app/src/models/segmentation
COPY src/services/segmentation_service.py /app/src/services/
CMD ["python3", "-m", "src.services.segmentation_service"]
