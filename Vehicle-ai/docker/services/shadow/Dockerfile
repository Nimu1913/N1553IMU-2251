FROM vehicle-ai/base:latest
COPY src/models/shadow /app/src/models/shadow
COPY src/services/shadow_service.py /app/src/services/
CMD ["python3", "-m", "src.services.shadow_service"]
