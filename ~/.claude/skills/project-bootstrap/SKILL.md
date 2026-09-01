---
name: project-bootstrap
description: Scaffolds a new production-ready project with all enterprise features — auth, database, CI/CD, monitoring, Docker, testing, and deployment. Use when starting a new project or when you need to add full production infrastructure to an existing skeleton.
---

# Project Bootstrap

## Overview

This skill creates a complete, production-ready project from scratch. It covers the full stack: frontend (React/Vue), backend (Node.js/.NET/Python), database (PostgreSQL/SQL Server), authentication (JWT/OAuth), CI/CD pipelines, containerization, monitoring, and more.

The user specifies their preferred tech stack at the beginning, and the skill adapts accordingly.

---

## Instructions

### Step 1: Gather Requirements

Ask the user to confirm:
- **Project name** and **description**
- **Frontend**: React, Vue, Angular, or none (API-only)
- **Backend**: Node.js (Express/Fastify), .NET (Web API), Python (FastAPI/Django), or Go
- **Database**: PostgreSQL, SQL Server, MySQL, MongoDB, or SQLite
- **Auth**: JWT, OAuth2, or session-based
- **CSS framework**: Tailwind, Bootstrap, or none
- **Package manager**: npm, yarn, pnpm, or bun
- **Testing framework**: Vitest/Jest, pytest, xUnit, etc.
- **Deployment target**: Docker/K8s, cloud (AWS/Azure/GCP), or VPS

If the user is unsure about any option, provide a reasonable default (React + Node.js + PostgreSQL + JWT + Tailwind + Docker).

### Step 2: Create Project Root

1. Initialize the directory and version control:
   ```
   mkdir <project-name>
   cd <project-name>
   git init
   ```

2. Create the top-level structure:
   ```
   <project-name>/
   ├── frontend/       # Frontend app
   ├── backend/        # Backend API
   ├── docker/         # Docker configs
   ├── .github/        # CI/CD workflows
   ├── scripts/        # Utility scripts
   └── docs/           # Documentation
   ```

### Step 3: Scaffold the Backend

Based on the chosen backend:

- **Node.js (Express/Fastify)**:
  - Initialize with `npm init -y` and install: express, cors, helmet, morgan, dotenv, prisma/typeorm, jsonwebtoken, bcrypt, zod/joi, winston, jest/vitest, supertest
  - Create `src/` structure: `routes/`, `controllers/`, `services/`, `middleware/`, `models/`, `config/`, `utils/`, `tests/`
  - Set up: Express app with middleware chain, error handler, health endpoint, CORS, rate limiting
  - Set up Prisma or TypeORM for database
  - Implement JWT auth middleware and auth routes (register, login, refresh, logout)
  - Add request validation with Zod
  - Set up Winston logger
  - Add `tsconfig.json` if using TypeScript

- **.NET Web API**:
  - Run `dotnet new webapi -n backend`
  - Add packages: Microsoft.AspNetCore.Authentication.JwtBearer, EF Core, Npgsql/SqlServer, Serilog, FluentValidation
  - Set up: Program.cs with middleware pipeline, JWT auth, EF Core DbContext, Serilog
  - Create Controllers/, Services/, Models/, Data/, Middleware/ folders
  - Implement auth endpoints, health check, model validation

- **Python (FastAPI)**:
  - Create virtual env, install: fastapi, uvicorn, sqlalchemy, alembic, psycopg2/pymongo, python-jose, passlib, pydantic, pytest, httpx
  - Set up `app/` structure: `routes/`, `models/`, `schemas/`, `services/`, `core/` (config, security, database)
  - Implement JWT auth, database session, Alembic migrations, CORS, logging

### Step 4: Scaffold the Frontend

Based on the chosen frontend:

- **React (Vite)**:
  - Run `npm create vite@latest frontend -- --template react` (or react-ts for TypeScript)
  - Install: react-router-dom, axios/react-query, zustand/redux, tailwindcss (if selected), react-hook-form + zod, vitest, testing-library
  - Create `src/` structure: `pages/`, `components/`, `hooks/`, `services/`, `context/`, `utils/`, `styles/`, `tests/`
  - Set up: React Router with lazy-loaded routes, auth context/provider, Axios instance with interceptors (JWT token injection, refresh logic), protected route wrapper
  - Configure Tailwind (postcss.config.js, tailwind.config.js)

- **Vue 3**:
  - Run `npm create vue@latest frontend`
  - Install: vue-router, pinia, axios, tailwindcss, vitest
  - Set up similar structure with Vue Composition API

### Step 5: Configure Authentication

- **JWT flow**:
  - Backend: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`
  - Access token: short-lived (15 min), Refresh token: long-lived (7 days, stored in httpOnly cookie)
  - Password hashing: bcrypt (cost factor 12)
  - Frontend: Axios interceptor catches 401, attempts token refresh, replays failed request
  - Protected routes redirect to login if unauthenticated

- **OAuth2** (if selected):
  - Setup with Google/GitHub/Azure AD using Passport.js or equivalent
  - Store provider + providerId in user model

### Step 6: Set Up Database

- Configure database connection via environment variables
- Create initial migration/schema:
  - `users` table (id, email, name, password_hash, role, created_at, updated_at, deleted_at for soft delete)
  - `sessions` or `refresh_tokens` table
  - Optional base tables per project needs
- Add seed script for initial data
- Set up connection pooling (pgbouncer for Postgres, or built-in pool)
- Add migration commands to package.json / Makefile

### Step 7: Add CI/CD Pipeline

Create `.github/workflows/ci.yml` with:
- Trigger on push/PR to main
- Lint step (ESLint/Pylint/dotnet format)
- Type check (tsc --noEmit / mypy / dotnet build)
- Test step (all unit + integration tests)
- Build step
- Security scan (npm audit / pip audit / dotnet list vulnerabilities)
- Docker build and push (if Docker selected)
- Deploy step (conditional on branch/tag)

Create `.github/workflows/cd.yml` with deploy to chosen target.

### Step 8: Docker Setup

Create Docker-related files:

- **`Dockerfile`** (multi-stage, one for backend, one for frontend):
  - Stage 1: Install deps + build
  - Stage 2: Copy artifacts + run with non-root user
  - Include health check

- **`docker-compose.yml`**:
  - Services: backend, frontend, database, redis (if needed), nginx (reverse proxy)
  - Volumes for database persistence
  - Environment variables via `.env` file
  - Health checks on all services

- **`.dockerignore`**: node_modules, .git, dist, __pycache__, .env

### Step 9: Add Monitoring & Logging

- **Structured logging**: JSON format, request ID correlation, log levels (debug/info/warn/error)
- **Health check endpoints**: `/api/health` (DB connectivity, uptime, memory usage)
- **Metrics** (optional): Prometheus endpoint (`/api/metrics`) with request count, latency, error rate
- **Sentry/error tracking** integration (if desired): Configure DSN in environment variables
- **Log rotation** for file-based logging

### Step 10: Configure Environment & Secrets

- Create `.env.example` with all required variables documented
- Variables to include:
  - `NODE_ENV` / `ASPNETCORE_ENVIRONMENT`
  - Database URL / connection string
  - JWT secret + issuer + audience
  - CORS origins
  - Redis URL (if used)
  - Sentry DSN (if used)
  - Port bindings
- Create `.env` validation script that checks all required vars are set
- Add `.env` to `.gitignore` (keep `.env.example` in repo)

### Step 11: Set Up Testing

- **Unit tests**: Cover all services, utilities, middleware
- **Integration tests**: API endpoint tests with test database
- **Configuration**:
  - Test database (in-memory or test container)
  - Test runner config file
  - Coverage thresholds (minimum 80%)
  - Pre-commit hook via husky/lint-staged that runs tests on changed files
- Add `test`, `test:coverage`, `test:watch` scripts

### Step 12: Add Documentation

- `README.md`: Project overview, setup instructions, available scripts, env vars table, API docs link, deployment guide
- `CONTRIBUTING.md`: How to contribute, code style, PR process
- `docs/architecture.md`: System architecture diagram and explanation
- `docs/api.md` or link to Swagger/OpenAPI docs

### Step 13: Final Hardening

- **Rate limiting** on API endpoints (express-rate-limit / ASP.NET middleware / slowapi)
- **CORS** configured to allow only specified origins
- **Helmet.js** security headers (or equivalent)
- **Input sanitization** against XSS and SQL injection
- **CSRF protection** (if using cookies for auth)
- **Content Security Policy** headers
- **Dependency auditing** script (`npm audit` / `pip audit`)
- **.gitattributes** for consistent line endings
- **EditorConfig** for consistent formatting

---

## Example Output

After running this skill, the project will have:

```
my-project/
├── backend/
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── docker/
│   └── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── scripts/
│   └── validate-env.sh
├── docs/
│   ├── architecture.md
│   └── api.md
├── .env.example
├── .gitignore
├── .editorconfig
├── .dockerignore
└── README.md
```

All with:
- ✅ JWT authentication (register, login, refresh, logout)
- ✅ Database migrations and models
- ✅ API validation and error handling
- ✅ CI/CD pipeline
- ✅ Docker multi-stage builds + compose
- ✅ Structured logging + health checks
- ✅ Unit + integration tests
- ✅ Security hardening
- ✅ Full documentation
