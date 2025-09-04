FROM vehicle-ai/base:latest
COPY src /app/src
CMD ["python3", "-m", "uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8080"]
