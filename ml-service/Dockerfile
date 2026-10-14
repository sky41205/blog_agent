# Autonomous Blogger — Python FastAPI Machine Learning Microservice Cloud Run Container
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Ensure ML models are bootstrapped and trained
RUN python -m app.training.train_all || true

EXPOSE 8000

# Start FastAPI microservice on dynamic PORT for Google Cloud Run
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
