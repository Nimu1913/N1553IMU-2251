FROM vehicle-ai/base:latest
COPY src/models/generation /app/src/models/generation
COPY src/services/generation_service.py /app/src/services/
CMD ["python3", "-m", "src.services.generation_service"]
