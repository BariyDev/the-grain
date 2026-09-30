# Development

How to set up the project locally, which commands exist and how the workflow is organized.

## Prerequisites

- [Bun](https://bun.sh) 1.3+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (must be running)

## First-time setup

```bash
git clone https://github.com/BariyDev/the-grain.git
cd the-grain
bun install                    # server dependencies
cp .env.example .env           # create the local environment file
docker compose up -d           # start PostgreSQL
bunx drizzle-kit migrate       # create the tables
```

## Running the project

Two terminals:

```bash
# Terminal 1 — API (port 3000)
bun --watch server/index.ts

# Terminal 2 — client (port 5173)
cd client
bun install
bun run dev
```

- API: http://localhost:3000 (health check: `GET /api/hello`)
- Client: http://localhost:5173

## Environment variables

`.env` is created from `.env.example` and is never committed:

| Variable            | Example                                                   | Purpose                                          |
| ------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| `APP_NAME`          | `myapp`                                                   | Prefix for the container name (`myapp-postgres`) |
| `POSTGRES_USER`     | `myapp`                                                   | Database user                                    |
| `POSTGRES_PASSWORD` | `myapp_secret`                                            | Database password (local development)            |
| `POSTGRES_DB`       | `myapp_db`                                                | Database name                                    |
| `DB_PORT`           | `5433`                                                    | Host port mapped to the container                |
| `JWT_SECRET`        | `dev_secret_change_me_before_production`                  | JWT signing secret                               |
| `DATABASE_URL`      | `postgresql://myapp:myapp_secret@127.0.0.1:5433/myapp_db` | Connection string                                |

The database container creates the user and the database only on the **first** start with an empty volume. Changing `POSTGRES_*` later has no effect until the volume is recreated (`docker compose down -v`).

## Ports

| Port   | Service                                 |
| ------ | --------------------------------------- |
| `3000` | API (Elysia)                            |
| `5173` | Client (Vite dev server)                |
| `5433` | PostgreSQL (mapped from container 5432) |

## Commands

### Server / repository root

| Command                     | What it does                                     |
| --------------------------- | ------------------------------------------------ |
| `bun run dev`               | Start the API with hot reload                    |
| `bun run lint`              | Lint everything with ESLint                      |
| `bun run lint:fix`          | Lint and autofix                                 |
| `bun run format`            | Format everything with Prettier                  |
| `bun run ci:format`         | Check formatting without changing files          |
| `bun run typecheck`         | Type-check server (`tsc`) and client (`vue-tsc`) |
| `bunx drizzle-kit generate` | Generate a migration from `server/db/schema.ts`  |
| `bunx drizzle-kit migrate`  | Apply pending migrations                         |
| `bunx drizzle-kit studio`   | Browse the database in a web UI                  |

### Client (`cd client`)

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `bun run dev`       | Start the Vite dev server                     |
| `bun run build`     | Type-check and build for production (`dist/`) |
| `bun run typecheck` | Type-check with `vue-tsc`                     |

### Docker

| Command                  | What it does                                             |
| ------------------------ | -------------------------------------------------------- |
| `docker compose up -d`   | Start PostgreSQL in the background                       |
| `docker compose ps`      | Show container status (wait for `healthy`)               |
| `docker compose logs db` | Show database logs                                       |
| `docker compose down`    | Stop and remove the container (the volume is kept)       |
| `docker compose down -v` | Remove the container **and the data volume** (data loss) |

## Git hooks

Hooks are installed automatically by `bun install` (husky) and run on every commit and push:

| Hook         | What it runs                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `pre-commit` | Prettier and ESLint on staged files (lint-staged, with `--fix`), then `bun run typecheck`        |
| `commit-msg` | commitlint: the message must follow [Conventional Commits](https://www.conventionalcommits.org/) |
| `pre-push`   | validate-branch-name: only `main`, `develop` and typed branches (`feature/*`, `docs/*`, …)       |

## Branching and commits

- Work always starts from `develop`: `git checkout -b feature/name develop`
- Commit types: `feat`, `fix`, `docs`, `chore`, `ci`, `build`, `refactor`, `test`
- Every branch is merged through a pull request with **Create a merge commit** (squash is not used)
- Releases go from `develop` to `main` through a separate PR (`Release vX.Y.Z`) followed by an annotated git tag
- Versioning follows [semver](https://semver.org/); tags match the sections in [CHANGELOG.md](../CHANGELOG.md)

## Continuous integration

`.github/workflows/ci.yml` runs on pushes to `main`/`develop` and on pull requests:

```
install (server + client, frozen lockfile) →
ci:format → lint → typecheck → build client
```

If a commit adds or updates dependencies, `bun.lock` (root) or `client/bun.lock` must be committed as well — otherwise the frozen install fails in CI.

## Troubleshooting

| Symptom                                   | Fix                                                                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `EADDRINUSE` on 3000/5173                 | The port is taken: `netstat -ano \| findstr :3000`, then `taskkill /PID <pid> /F`                                      |
| `DATABASE_URL is not set in .env`         | Missing `.env`, or the command is run from the wrong directory                                                         |
| `relation "users" does not exist`         | Migrations are not applied: `bunx drizzle-kit migrate`                                                                 |
| `password authentication failed`          | `.env` credentials differ from the ones the volume was created with: `docker compose down -v` (data loss) and recreate |
| Prettier fails locally with CRLF warnings | Windows artifact: run `bun run format` (the repository itself stores LF)                                               |
| CI fails with `frozen-lockfile`           | `bun.lock` / `client/bun.lock` were not committed after changing dependencies                                          |
