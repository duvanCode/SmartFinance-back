# SmartFinance Backend

Personal finance management system with AI - Backend REST API.

## Tech Stack

- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Containerization:** Docker (Alpine Linux)
- **Architecture:** Hexagonal Architecture by Feature
- **Testing:** Jest

## Project Structure

```
src/
├── shared/                    # Shared modules across features
│   ├── domain/               # Base entities and interfaces
│   ├── application/          # Base use cases
│   └── infrastructure/       # Prisma, configs
├── features/                 # Feature modules (hexagonal)
├── app.module.ts
└── main.ts
```

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+ (or use Docker)

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Database Setup

**Option A: Using Docker**
```bash
docker-compose up db -d
```

**Option B: Local PostgreSQL**
- Create database `smartfinance`
- Update `DATABASE_URL` in `.env`

### 4. Run Migrations

```bash
npm run prisma:migrate:dev
```

### 5. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`

## Docker

### Development

```bash
docker-compose --profile dev up
```

### Production

```bash
docker-compose up
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start in development mode |
| `npm run start:prod` | Start in production mode |
| `npm run build` | Build the application |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run prisma:migrate:dev` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed the database |

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

Health check endpoint will be available at `/health`

## Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters) organized by feature:

```
features/
└── [feature-name]/
    ├── domain/           # Entities, Value Objects, Repository Interfaces
    ├── application/      # Use Cases, DTOs
    └── infrastructure/   # Controllers, Prisma Repositories
```

## License

MIT
