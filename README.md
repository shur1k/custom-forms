# Custom Forms

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) & Docker Compose

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DB_NAME=custom_forms
DB_USER=cf_user
DB_PASSWORD=cf_pass
DATABASE_URL=postgres://cf_user:cf_pass@localhost:5432/custom_forms
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
PORT=3000
```

---

## Database

### Start the PostgreSQL container

```bash
docker compose -f docker-compose.dev.yml up -d
```

### Run migrations

```bash
npm run db:migrate
```

### Seed reference data (roles + schema types)

```bash
npm run db:seed
```

### Other DB commands

| Command | Description |
|---|---|
| `npm run db:generate` | Generate a new migration from schema changes |
| `npm run db:push` | Push schema directly to DB (dev only, no migration file) |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |

### Stop the database

```bash
docker compose -f docker-compose.dev.yml down
```

---

## Backend API

### Run in development mode (with watch)

```bash
npm exec nx serve api
```

The API starts at `http://localhost:3000`.

### Run unit tests

```bash
npm exec nx test api
```

### Build for production

```bash
npm exec nx build api
```

---

## API Reference

Interactive Swagger docs are available at:

```
http://localhost:3000/api/docs
```

### Auth endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user, returns JWT |
| POST | `/api/v1/auth/login` | Login, returns JWT |

### Schema endpoints (JWT required)

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/schemas` | List all schemas (`?page&limit`) |
| POST | `/api/v1/schemas` | Create a schema |
| GET | `/api/v1/schemas/:id` | Get a schema by id |
| PATCH | `/api/v1/schemas/:id` | Update title or schema body |
| DELETE | `/api/v1/schemas/:id` | Delete a schema |
| POST | `/api/v1/schemas/:id/publish` | Snapshot current schema as a new version |
| GET | `/api/v1/schemas/:id/versions` | List published versions |
