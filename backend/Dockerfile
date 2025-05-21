# Build stage
FROM python:3.11-alpine AS builder

WORKDIR /install

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    libffi-dev \
    musl-dev \
    gcc \
    postgresql-dev

# Install Python dependencies into a separate folder
COPY requirements.txt .
RUN pip install --prefix=/install/deps --no-cache-dir -r requirements.txt

# Final runtime stage
FROM python:3.11-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    libpq

# Copy installed Python dependencies
COPY --from=builder /install/deps /usr/local/

# Copy application code
COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
