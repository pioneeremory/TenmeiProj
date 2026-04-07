FROM python:3.13-slim

WORKDIR /app

COPY narration_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY narration_service/main.py .

# We run on 8001 because your Django StoryService is looking for 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]