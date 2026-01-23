# SmartFinance Backend - Sistema de Gestión Financiera Personal

Backend API REST para gestión financiera personal con capacidades de IA.

## Tech Stack

- **Framework:** NestJS 10
- **Language:** TypeScript 5
- **Database:** PostgreSQL 16
- **ORM:** Prisma 5
- **Architecture:** Hexagonal (Ports & Adapters) por Feature
- **Testing:** Jest
- **Containerization:** Docker + Docker Compose

## Prerrequisitos

- Node.js 20+ (si ejecutas localmente)
- Docker 24+ y Docker Compose 2+ (recomendado)
- PostgreSQL 16+ (si ejecutas sin Docker)

## Instalación Local (Sin Docker)

1. **Clonar repositorio:**
```bash
git clone <repo-url>
cd SmartFinance-back
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Generar Prisma Client:**
```bash
npm run prisma:generate
```

5. **Ejecutar migraciones:**
```bash
npm run prisma:migrate:dev
```

6. **Ejecutar seed (opcional):**
```bash
npm run prisma:seed
```

7. **Iniciar servidor en desarrollo:**
```bash
npm run start:dev
```

La API estará disponible en: `http://localhost:3000/api/v1`

## Instalación con Docker (Recomendado)

1. **Clonar repositorio:**
```bash
git clone <repo-url>
cd SmartFinance-back
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Levantar solo la base de datos:**
```bash
docker-compose up db -d
```

4. **Levantar todos los servicios:**
```bash
docker-compose up -d --build
```

5. **Ver logs:**
```bash
docker-compose logs -f app
```

6. **Modo desarrollo con hot-reload:**
```bash
docker-compose --profile dev up
```

7. **Detener servicios:**
```bash
docker-compose down
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start` | Inicia la aplicación |
| `npm run start:dev` | Inicia en modo desarrollo con hot-reload |
| `npm run start:prod` | Inicia en modo producción |
| `npm run build` | Compila el proyecto |
| `npm test` | Ejecuta tests unitarios |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:e2e` | Tests end-to-end |
| `npm run test:cov` | Tests con reporte de cobertura |
| `npm run prisma:generate` | Genera Prisma Client |
| `npm run prisma:migrate:dev` | Ejecuta migraciones en desarrollo |
| `npm run prisma:studio` | Abre Prisma Studio |
| `npm run prisma:seed` | Ejecuta seed de base de datos |

## Arquitectura

Este proyecto sigue **Arquitectura Hexagonal** (Ports & Adapters) organizada por features.

### Estructura de Carpetas
```
src/
├── shared/                    # Código compartido entre features
│   ├── domain/               # Entidades y repositorios base
│   ├── application/          # Use cases base
│   └── infrastructure/       # Prisma, Config
├── features/                 # Features del sistema
│   └── [feature]/
│       ├── domain/           # Entidades, VOs, Interfaces
│       ├── application/      # Use Cases, DTOs
│       └── infrastructure/   # Controllers, Repos, Services
├── app.module.ts
└── main.ts
```

### Capas de la Arquitectura

1. **Domain (Dominio):** Lógica de negocio pura, sin dependencias externas
2. **Application (Aplicación):** Use cases que orquestan la lógica
3. **Infrastructure (Infraestructura):** Implementaciones concretas (DB, APIs, Controllers)

## Variables de Entorno

Ver `.env.example` para lista completa. Variables principales:

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `DATABASE_URL` | Conexión a PostgreSQL | Si |
| `NODE_ENV` | Entorno (development/production) | Si |
| `PORT` | Puerto de la aplicación | No (default: 3000) |
| `JWT_SECRET` | Secret para tokens JWT | Si |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Para OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | Para OAuth |
| `ANTHROPIC_API_KEY` | API Key de Anthropic Claude | Para IA |
| `OPENAI_API_KEY` | API Key de OpenAI | Para IA |

## Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:cov

# Tests e2e
npm run test:e2e
```

**Objetivo de cobertura:** 80% (líneas, funciones, statements)

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

Health check: `GET /health`

(Endpoints adicionales se documentarán conforme se implementen)

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado.
