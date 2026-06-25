FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

WORKDIR /app

COPY backend-api/requirements.txt backend-api/requirements.txt
RUN pip install --no-cache-dir -r backend-api/requirements.txt

COPY backend-api backend-api

EXPOSE 7860

CMD ["python", "backend-api/python-server.py"]
