FROM vehicle-ai/base:latest
COPY src/models/harmonization /app/src/models/harmonization
COPY src/services/harmonization_service.py /app/src/services/
CMD ["python3", "-m", "src.services.harmonization_service"]
