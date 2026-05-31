# Full-Stack Project

Django + DRF backend with React + Vite + TypeScript frontend.

---

## Backend Setup

### 1. Create and activate a virtual environment

```bash
cd backend

# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
# Production dependencies
pip install -r requirements.txt

# Development dependencies (test tools, linters)
pip install -r requirements-dev.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env and set SECRET_KEY, DATABASE_URL, etc.
```

### 4. Run database migrations

```bash
python manage.py migrate
```

### 5. Create a superuser (optional)

```bash
python manage.py createsuperuser
```

### 6. Start the development server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

API documentation (Swagger UI): `http://localhost:8000/api/docs/`

Django admin: `http://localhost:8000/admin/`

---

### Running tests

```bash
pytest
pytest --cov=apps --cov-report=html  # with coverage report
```

### Code quality

```bash
black .          # format code
isort .          # sort imports
flake8 .         # lint
```

---

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env if needed (default points to http://localhost:8000)
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

The Vite dev server proxies all `/api` requests to the Django backend at `http://localhost:8000`, so both servers must be running simultaneously during development.

### Other frontend commands

```bash
npm run build        # production build (outputs to dist/)
npm run preview      # preview the production build locally
npm run type-check   # TypeScript type checking without emitting
npm run lint         # ESLint
```

---

## Production Deployment

### Backend

```bash
# Set DJANGO_SETTINGS_MODULE to production settings
export DJANGO_SETTINGS_MODULE=config.settings.production

# Run the start script (migrate + collectstatic + gunicorn)
bash scripts/start.sh
```

### Frontend

```bash
cd frontend
npm run build
# Serve the dist/ folder with a static file server or CDN
```

---

## Project Structure

```
jobeasy/
├── backend/                  Django + DRF API
│   ├── jobeasy/              Project settings, URLs, WSGI/ASGI
│   ├── accounts/             Custom user model, JWT auth endpoints
│   ├── jobs/                 Job search (Remotive + Jobicy, free APIs)
│   ├── agent/                AI job agent (rule-based NLP, no API key)
│   ├── saved/                Saved jobs per user
│   ├── manage.py
│   └── requirements.txt
└── frontend/                 React + Vite SPA
    └── src/
        ├── api/              Axios instance + per-feature API modules
        ├── components/       Reusable UI and layout components
        ├── context/          AuthContext (JWT-backed auth state)
        └── pages/            Page components (landing, jobs, agent, profile)
```

## API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/v1/auth/register/` | No | Register new user |
| POST | `/api/v1/auth/login/` | No | Obtain JWT tokens |
| POST | `/api/v1/auth/token/refresh/` | No | Refresh access token |
| POST | `/api/v1/auth/logout/` | Yes | Blacklist refresh token |
| GET/PATCH | `/api/v1/auth/me/` | Yes | Get or update current user |
| POST | `/api/v1/auth/change-password/` | Yes | Change password |
