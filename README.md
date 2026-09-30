# Employee Leaderboard API

A full-stack employee leaderboard application that tracks employee achievements, assigns points based on predefined activities, and ranks employees by their cumulative scores.

**Built with:** FastAPI · React · PostgreSQL · Docker · Clerk

---

## Key Features

- **Employee Management** — Manage employee information and roles.
- **Achievement Tracking** — Record individual achievements and scores.
- **Activity-Based Scoring** — Assign predefined points to supported activities.
- **Leaderboard** — Rank employees based on cumulative scores.
- **Authentication** — Clerk-based user authentication.
- **Role-Based Access** — Separate admin and regular-user permissions.
- **Persistent Database** — PostgreSQL with Docker volume persistence.
- **Database Migrations** — Schema changes managed with Alembic.
- **API Documentation** — Interactive Swagger UI and ReDoc.

---

## Quickstart

### Prerequisites

Install:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

For development without Docker, you will also need:

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)
- Node.js and npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone <repository-url>
cd leaderboard-project
```

### 2. Configure environment variables

Create your local environment file.

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Then set the required values:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=leaderboard_db
DATABASE_USER=admin
DATABASE_PASSWORD=admin123

CLERK_SECRET_KEY=
CLERK_JWT_KEY=
CLERK_AUTHORIZED_PARTIES=

ALLOWED_EMAILS=
ALLOWED_EMAIL_DOMAINS=cloudraft.io
```

> **Note:** Do not commit `.env` or expose secret Clerk credentials.

### 3. Start the application

```bash
docker compose up -d
```

Check the services:

```bash
docker compose ps
```

The application consists of three services: `frontend`, `backend`, and `db`.

### 4. Run database migrations

```bash
docker compose exec backend uv run alembic upgrade head
```

### 5. Open the application

| Service    | URL                            |
| ---------- | ------------------------------ |
| Frontend   | http://localhost:5173          |
| Backend    | http://localhost:8000          |
| Swagger UI | http://localhost:8000/docs     |
| ReDoc      | http://localhost:8000/redoc    |

---

## Architecture

```text
                     ┌──────────────┐
                     │     User     │
                     │   Browser    │
                     └──────┬───────┘
                            │
                            ▼
                ┌─────────────────────┐
                │      Frontend       │
                │   React + Vite      │
                │       Nginx         │
                │       :5173         │
                └──────────┬──────────┘
                           │
                        HTTP API
                           │
                           ▼
                ┌─────────────────────┐
                │       Backend       │
                │  FastAPI + Uvicorn  │
                │       :8000         │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │     PostgreSQL      │
                │       :5432         │
                └─────────────────────┘

                     ┌──────────┐
                     │  Clerk   │
                     │   Auth   │
                     └──────────┘
```

### Services

| Service        | Technology            | Port     |
| -------------- | --------------------- | -------- |
| Frontend       | React + Vite + Nginx  | 5173     |
| Backend        | FastAPI + Uvicorn     | 8000     |
| Database       | PostgreSQL 16         | 5432     |
| Authentication | Clerk                 | External |

When running inside Docker Compose, the backend connects to PostgreSQL using the service name `db` rather than `localhost`.

---

## Project Structure

```text
leaderboard-project/
│
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── uv.lock
├── alembic.ini
├── README.md
├── .env
├── .env.example
│
├── alembic/
│   └── versions/
│
├── src/
│   ├── main.py
│   ├── auth.py
│   ├── config.py
│   ├── constants.py
│   ├── logging_config.py
│   │
│   ├── db/
│   │   └── factory.py
│   │
│   ├── models/
│   │   ├── employee.py
│   │   ├── employee_score.py
│   │   └── access_request.py
│   │
│   ├── routes/
│   │   ├── employees.py
│   │   ├── scores.py
│   │   ├── leaderboard.py
│   │   ├── activities.py
│   │   ├── stats.py
│   │   └── access.py
│   │
│   └── schemas/
│       ├── employee.py
│       ├── score.py
│       ├── leaderboard.py
│       └── access_request.py
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
```

---

## Environment Variables

The backend uses environment variables for database, authentication, and access-control configuration.

### Database

| Variable            | Description        |
| ------------------- | ------------------ |
| `DATABASE_HOST`     | PostgreSQL host    |
| `DATABASE_PORT`     | PostgreSQL port    |
| `DATABASE_NAME`     | Database name      |
| `DATABASE_USER`     | Database user      |
| `DATABASE_PASSWORD` | Database password  |

### Clerk

| Variable                   | Description                         |
| -------------------------- | ----------------------------------- |
| `CLERK_SECRET_KEY`         | Clerk backend secret                |
| `CLERK_JWT_KEY`            | Clerk JWT verification key          |
| `CLERK_AUTHORIZED_PARTIES` | Authorized application origin(s)    |

### Access Control

| Variable                | Description                        |
| ----------------------- | ---------------------------------- |
| `ALLOWED_EMAILS`        | Explicitly allowed email addresses |
| `ALLOWED_EMAIL_DOMAINS` | Allowed email domains              |

Example:

```env
ALLOWED_EMAIL_DOMAINS=cloudraft.io
```

> **Security:** Keep actual credentials in `.env`. Never commit secret values to source control.

---

## Database

PostgreSQL is used for persistent application data. The main leaderboard data is stored in two tables with a one-to-many relationship:

```text
employees
    │
    │ 1 : N
    ▼
employee_scores
```

### `employees`

Stores employee-level information.

| Column             | Description                |
| ------------------ | -------------------------- |
| `employee_id`      | Unique employee ID         |
| `name`             | Employee name              |
| `email`            | Employee email             |
| `clerk_user_id`    | Associated Clerk user      |
| `role`             | Application role           |
| `cumulative_score` | Current total score        |

### `employee_scores`

Stores individual achievement records. Each employee can have multiple score records.

| Column        | Description                     |
| ------------- | ------------------------------- |
| `score_id`    | Unique score record             |
| `employee_id` | Employee who earned the score   |
| `activity`    | Activity performed              |
| `score`       | Points awarded                  |
| `created_at`  | Time of record creation         |

---

## Activities & Scoring

Employees receive points for completing predefined activities.

| Activity                                   | Points |
| ------------------------------------------ | -----: |
| Interview Panel                            |    500 |
| OSS PR merged                              |    500 |
| Blog Post                                  |  1,000 |
| Blog crosses 5,000 views in first 30 days  |  1,000 |
| Internal knowledge session                 |  1,000 |
| External Community Event (Speaker)         |  2,000 |
| KubeCon or other Major Event (Speaker)     |  5,000 |
| Referral                                   |  5,000 |

Activity definitions are maintained in `src/constants.py`:

- `ActivityType` defines the supported activities.
- `ACTIVITY_POINTS` maps each activity to its corresponding score.

---

## Cumulative Scores & Leaderboard

Each achievement is stored as an individual record in `employee_scores`. The employee's cumulative score is maintained in `employees.cumulative_score`.

A PostgreSQL trigger keeps the cumulative score synchronized when score records are:

- Inserted
- Updated
- Deleted

The leaderboard orders employees by their cumulative score.

```text
Achievement
     │
     ▼
employee_scores
     │
     ▼
Database Trigger
     │
     ▼
cumulative_score
     │
     ▼
Leaderboard
```

---

## Authentication & Authorization

The application uses [Clerk](https://clerk.com/) for authentication. The backend validates the Clerk session token using the configured Clerk credentials.

### Authentication

If a request is not authenticated, the API returns:

```text
401 Unauthorized
```

### Admin Authorization

Admin-only operations perform an additional role check. The backend:

1. Gets the authenticated Clerk user ID.
2. Finds the corresponding employee.
3. Checks the employee's role.
4. Allows the operation only when the role is `admin`.

An authenticated user without the required role receives:

```text
403 Forbidden
```

---

## API

The backend is built using FastAPI. Routes are organized under `src/routes/`.

Current route modules:

- `employees.py`
- `scores.py`
- `leaderboard.py`
- `activities.py`
- `stats.py`
- `access.py`

### API Documentation

| Tool       | URL                         |
| ---------- | --------------------------- |
| Swagger UI | http://localhost:8000/docs  |
| ReDoc      | http://localhost:8000/redoc |

These provide interactive documentation for the available API endpoints.

---

## Database Migrations

[Alembic](https://alembic.sqlalchemy.org/) is used for database schema migrations.

Apply migrations:

```bash
uv run alembic upgrade head
```

With Docker:

```bash
docker compose exec backend uv run alembic upgrade head
```

Check the current migration:

```bash
uv run alembic current
```

Create a migration:

```bash
uv run alembic revision --autogenerate -m "describe change"
```

---

## Development

### Backend

Install dependencies:

```bash
uv sync
```

Run the development server:

```bash
uv run uvicorn src.main:app --reload
```

Backend runs at http://localhost:8000.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173.

---

## Docker Commands

| Action                  | Command                              |
| ----------------------- | ------------------------------------ |
| Start                   | `docker compose up -d`               |
| Stop                    | `docker compose down`                |
| Check services          | `docker compose ps`                  |
| View logs               | `docker compose logs`                |
| Backend logs            | `docker compose logs -f backend`     |
| Rebuild                 | `docker compose build`               |
| Rebuild without cache   | `docker compose build --no-cache`    |
| Restart                 | `docker compose restart`             |

---

## Data Persistence

PostgreSQL uses the Docker named volume `pgdata`, mounted at:

```text
/var/lib/postgresql/data
```

Running `docker compose down` does **not** remove this volume, so database data remains available when the application is started again.

> **Warning:** `docker compose down -v` removes the Docker volume and **deletes all stored PostgreSQL data**.

---

## Troubleshooting

### Docker is not running

Make sure Docker Desktop is running, then check:

```bash
docker ps
```

### Backend cannot connect to PostgreSQL

When running through Docker Compose, the database host should be `db`, not `localhost`.

### Database schema is missing

Run the migrations:

```bash
docker compose exec backend uv run alembic upgrade head
```

### Check backend logs

```bash
docker compose logs backend
```

### Check all services

```bash
docker compose ps
```

---

## Development Workflow

```text
Clone Repository
       │
       ▼
Configure .env
       │
       ▼
Start Docker Compose
       │
       ▼
Run Migrations
       │
       ▼
Develop / Test
       │
       ▼
Verify Frontend + API
       │
       ▼
Commit Changes
```

---

## Quick Reference

| Action            | Command / URL                                                   |
| ----------------- | --------------------------------------------------------------- |
| Start application | `docker compose up -d`                                          |
| Stop application  | `docker compose down`                                           |
| Check services    | `docker compose ps`                                             |
| View logs         | `docker compose logs`                                           |
| Backend logs      | `docker compose logs -f backend`                                |
| Run migrations    | `docker compose exec backend uv run alembic upgrade head`       |
| Rebuild           | `docker compose build`                                          |
| Frontend          | http://localhost:5173                                           |
| Backend           | http://localhost:8000                                           |
| Swagger           | http://localhost:8000/docs                                      |
