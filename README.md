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

### Seed reference data (roles + schema types + superuser)

```bash
npm run db:seed
```

### Stop the database

```bash
docker compose -f docker-compose.dev.yml down
```

### Other DB commands

| Command | Description |
|---|---|
| `npm run db:generate` | Generate a new migration from schema changes |
| `npm run db:push` | Push schema directly to DB (dev only, no migration file) |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |

---

## Backend API

| Command | Description |
|---|---|
| `npm run api:serve` | Start API in development mode (watch) |
| `npm run api:build` | Build API for production |
| `npm run api:test` | Run API unit tests |

The API starts at `http://localhost:3000`.

---

## Frontend

### Development

Start all apps together (remotes must be running for the shell to load them):

```bash
npm run fe:serve
```

Or start apps individually:

| Command | App | Port |
|---|---|---|
| `npm run fe:serve:shell` | Shell (host) | 4200 |
| `npm run fe:serve:designer` | Designer MFE | 4201 |
| `npm run fe:serve:runtime` | Runtime MFE | 4202 |
| `npm run fe:serve:user-admin` | User Administration MFE | 4203 |

All apps run with file-watch and live-reload enabled by default.

### Production build

```bash
npm run fe:build
```

Or build a single app:

| Command | Description |
|---|---|
| `npm run fe:build:shell` | Build shell |
| `npm run fe:build:designer` | Build designer MFE |
| `npm run fe:build:runtime` | Build runtime MFE |
| `npm run fe:build:user-admin` | Build user-administration MFE |

### Storybook — shared UI components

```bash
npm run fe:storybook
```

Opens at `http://localhost:4400`. Documents `Button`, `Input`, and `Select` from `@custom-forms/ui`.

To produce a static Storybook bundle (e.g. for CI or hosting):

```bash
npm run fe:storybook:build
```

Output goes to `dist/storybook/ui`.

---

## API Client (code generation)

The TypeScript API client is auto-generated from the backend's Swagger spec.
Run the API first, then regenerate whenever the backend changes:

```bash
npm run api:serve &
npm run api:generate-client
```

Generated types are available at `@custom-forms/api-client`.

---

## API Reference

Interactive Swagger docs:

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

### User endpoints (admin JWT required)

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/users` | List all users |
| PATCH | `/api/v1/users/:id/role` | Update a user's role |
