FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements-prod.txt .
RUN pip install --no-cache-dir -r requirements-prod.txt

COPY backend/ .

CMD python -m uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}
