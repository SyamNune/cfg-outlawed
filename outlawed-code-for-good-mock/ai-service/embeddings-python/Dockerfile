FROM python:3.11-slim

WORKDIR /app

# Install build essentials and certifi for MongoDB SSL
RUN apt-get update && apt-get install -y build-essential curl && rm -rf /var/lib/apt/lists/*

# Install python dependencies first to cache them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the python service
COPY . .

# Expose port (default 8001)
EXPOSE 8001

# The cache directory for huggingface models so we can map it via volume
ENV HUGGINGFACE_HUB_CACHE=/root/.cache/huggingface

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
