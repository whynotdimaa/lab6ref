# ⚡ TaskFlow Hub — Преміум Менеджер Завдань

[![TaskFlow Hub CI/CD Pipeline](https://github.com/whynotdimaa/geocenter/actions/workflows/ci.yml/badge.svg)](https://github.com/whynotdimaa/geocenter/actions/workflows/ci.yml)

**TaskFlow Hub** — це сучасний, високопродуктивний та візуально досконалий веб-додаток для керування завданнями, побудований за мікросервісною архітектурою. Проєкт розроблено в рамках **Лабораторної роботи №6 (DevOps, CI/CD, Docker)** з метою демонстрації сучасних підходів до контейнеризації, оркестрації та автоматизованого тестування.

---

## 🏛️ Архітектура Системи

Додаток складається з чотирьох взаємопов'язаних контейнерів, об'єднаних у єдину віртуальну мережу Docker:
1. **Frontend**: Односторінковий додаток (SPA) на **React (Vite)** з преміальним дизайном (glassmorphism, темна тема, інтерактивні елементи, іконки Lucide). Роздається за допомогою легкого сервера **Nginx**.
2. **Backend**: Швидке асинхронне REST API на **FastAPI (Python 3.12)** з використанням **SQLAlchemy ORM**.
3. **Database**: Реляційна СУБД **PostgreSQL 16** для збереження даних про завдання.
4. **API Gateway**: Глобальний зворотний проксі-сервер на **Nginx**, який прослуховує порт `80` та перенаправляє запити на фронтенд та бекенд.

---

## 🚀 Швидкий запуск через Docker (Рекомендовано)

Для автоматичного розгортання всього стеку технологій вам знадобиться лише встановлений **Docker** та **Docker Compose**.

### Крок 1: Клонування репозиторію та перехід до папки
```bash
cd lab6ref
```

### Крок 2: Запуск контейнерів
Запустіть оркестрацію за допомогою наступної команди:
```bash
docker-compose up --build
```
*Ця команда автоматично завантажить необхідні образи, збере бекенд і фронтенд, налаштує мережу та запустить базу даних із перевіркою працездатності (healthcheck), після чого запустить самі додатки.*

### Крок 3: Перевірка роботи
Відкрийте веб-браузер за адресою:
- 🌐 **Додаток (Frontend)**: [http://localhost/](http://localhost/)
- ⚙️ **Документація API (Swagger)**: [http://localhost/api/docs](http://localhost/api/docs) (проксується з бекенду)
- 🏥 **Healthcheck Бекенду**: [http://localhost/api/health](http://localhost/api/health)

---

## 💻 Локальний запуск (Без Docker)

Якщо ви бажаєте запустити компоненти окремо без використання контейнеризації:

### 1. Запуск Бекенду (FastAPI)
Перейдіть до директорії бекенду, налаштуйте віртуальне середовище та запустіть сервер:
```bash
cd backend
python -m venv .venv
# Активація середовища:
# Windows (PowerShell): .venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Бекенд автоматично створить локальну базу даних SQLite `taskflow.db` у корені папки `backend` за відсутності PostgreSQL.*

### 2. Запуск Фронтенду (React)
Перейдіть до директорії фронтенду, встановіть залежності та запустіть Vite dev-сервер:
```bash
cd frontend
npm install
npm run dev
```
*Фронтенд буде доступний за адресою [http://localhost:5173/](http://localhost:5173/) та автоматично з'єднається з локальним бекендом на порту 8000.*

---

## ⚙️ Змінні Середовища (Environment Variables)

Усі змінні середовища за замовчуванням налаштовані у файлі `docker-compose.yml`. Ви можете перевизначити їх або створити локальний файл `.env` у корені проєкту.

| Змінна | Сервіс | Опис | Значення за замовчуванням |
| :--- | :--- | :--- | :--- |
| `POSTGRES_DB` | `db` | Назва бази даних PostgreSQL | `taskflow` |
| `POSTGRES_USER` | `db` | Ім'я адміністратора СУБД | `postgres` |
| `POSTGRES_PASSWORD` | `db` | Пароль до бази даних | `postgrespassword123` |
| `DATABASE_URL` | `backend` | Рядок підключення до БД (SQLAlchemy) | `postgresql://postgres:postgrespassword123@db:5432/taskflow` |

---

## 🗺️ Опис REST API Endpoints

Бекенд реалізує повноцінний RESTful API для керування завданнями:

### 1. Загальні
- **`GET /api/health`** — Перевірка статусу системи.
  - *Приклад відповіді*: `{"status": "healthy", "service": "taskflow-backend"}`

### 2. Завдання (CRUD)
- **`GET /api/tasks`** — Отримання списку завдань. Підтримує фільтрацію за допомогою query-параметра `completed` (наприклад, `/api/tasks?completed=true`).
- **`POST /api/tasks`** — Створення нового завдання.
  - *Тіло запиту (JSON)*:
    ```json
    {
      "title": "Здати лабораторну роботу №6",
      "description": "Підготувати Docker-контейнери та звіт",
      "priority": "high"
    }
    ```
- **`GET /api/tasks/{task_id}`** — Отримання деталей конкретного завдання за ID.
- **`PATCH /api/tasks/{task_id}`** — Часткове оновлення завдання (наприклад, зміна статусу виконання або пріоритету).
  - *Тіло запиту (JSON)*: `{"completed": true}`
- **`DELETE /api/tasks/{task_id}`** — Видалення завдання за ID.

### 3. Статистика та Аналітика
- **`GET /api/stats`** — Отримання загальної статистики для аналітичної панелі фронтенду.
  - *Приклад відповіді*:
    ```json
    {
      "total": 5,
      "completed": 2,
      "pending": 3,
      "percentage": 40.0,
      "priority_stats": {
        "high": 1,
        "medium": 3,
        "low": 1
      }
    }
    ```

---

## 🧪 Запуск Автоматичних Тестів

Для перевірки бізнес-логіки бекенду написані юніт-тести за допомогою фреймворку `pytest`.

### Локальний запуск тестів:
```bash
cd backend
pytest -v
```

### Очікуваний результат тестування:
```text
============================= test session starts =============================
platform win32 -- Python 3.12.x, pytest-8.1.1, pluggy-1.4.0
collected 4 items

app/test_main.py::test_health_check PASSED                               [ 25%]
app/test_main.py::test_create_task PASSED                                [ 50%]
app/test_main.py::test_get_tasks PASSED                                  [ 75%]
app/test_main.py::test_get_stats PASSED                                  [100%]

============================== 4 passed in 0.42s ==============================
```

---

## 🔄 Інтеграція CI/CD (GitHub Actions)

Впроваджено повноцінний конвеєр безперервної інтеграції (CI) за допомогою **GitHub Actions** (конфігурація у папочці [.github/workflows/ci.yml](file:///.github/workflows/ci.yml)):
1. **Код-стайл (Linting)**: Перевіряє синтаксис та відповідність стандартам за допомогою лінтера `flake8`.
2. **Юніт-тести**: Автоматично розгортає оточення в Ubuntu-контейнері та запускає `pytest` для перевірки API.
3. **Збірка Docker**: Тестує побудову образів бекенду та фронтенду, щоб гарантувати відсутність помилок збірки у майбутньому.
