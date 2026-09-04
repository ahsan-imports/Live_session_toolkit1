FROM python:3.12-slim

WORKDIR /app

# System deps needed to build psycopg2 against PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Most hosts (Railway, Render, Fly) inject $PORT at runtime; fall back to
# 8000 for plain `docker run` locally.
ENV PORT=8000
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
