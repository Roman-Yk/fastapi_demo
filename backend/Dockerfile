# Build stage - compile dependencies
FROM python:3.11-alpine AS builder

WORKDIR /build

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    libffi-dev \
    musl-dev \
    gcc \
    postgresql-dev

# Copy and install Python dependencies including dev/test packages
# This layer will be cached unless requirements files change
COPY requirements*.txt ./
RUN pip install --user --no-cache-dir -r requirements.txt && \
    if [ -f requirements-dev.txt ]; then pip install --user --no-cache-dir -r requirements-dev.txt; fi

# Final runtime stage
FROM python:3.11-alpine

WORKDIR /app

# Install runtime dependencies for PostgreSQL, OCR, and PDF processing
RUN apk add --no-cache \
    libpq \
    tesseract-ocr \
    tesseract-ocr-data-eng \
    poppler-utils \
    && rm -rf /var/cache/apk/*

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app

# Copy application code
COPY . .

EXPOSE 8000

# Run with reload for local development
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]