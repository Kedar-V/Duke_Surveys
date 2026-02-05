FROM python:3.11-slim

WORKDIR /app
COPY app ./app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/certs \
	&& curl -o /app/certs/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt




EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
