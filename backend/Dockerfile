FROM python:3.12-slim

WORKDIR /app

# Встановлення системних бібліотек для збірки, якщо знадобляться
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Копіювання та встановлення Python залежностей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копіювання всього коду бекенду
COPY . .

EXPOSE 8000

# Команда для запуску додатку через Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
