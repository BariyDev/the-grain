# Architecture

The Grain is a small social network: users sign up, log in, write short posts and read a public feed.

## Overview

The project is a monorepo with two applications and a database:

```
┌─────────────────────────┐        HTTP/JSON        ┌─────────────────────────┐
│ Client — Vue 3 SPA      │ ──────────────────────► │ API — Elysia (Bun)      │
│ http://localhost:5173   │ ◄────────────────────── │ http://localhost:3000   │
└─────────────────────────┘                         └────────────┬────────────┘
                                                                 │ SQL (Drizzle ORM)
                                                                 ▼
                                                    ┌─────────────────────────┐
                                                    │ PostgreSQL 16 (Docker)  │
                                                    │ host port 5433          │
                                                    └─────────────────────────┘
```

- The **client** is a single-page application (Vue 3 + TypeScript + Vite).
- The **API** is a stateless HTTP server built with Elysia on the Bun runtime.
- The **database** is PostgreSQL 16 in a Docker container; the data lives in a Docker volume.

## Technology stack

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Runtime  | Bun 1.3                                                           |
| Backend  | Elysia 1.4, TypeScript                                            |
| Database | PostgreSQL 16 (Docker), Drizzle ORM, drizzle-kit                  |
| Auth     | JWT (`@elysiajs/jwt`), argon2id password hashing (`Bun.password`) |
| Frontend | Vue 3, TypeScript, Vite, vue-router, vue-i18n                     |
| Quality  | ESLint, Prettier, husky hooks, commitlint, GitHub Actions         |

## Repository layout

```
the-grain/
├── client/                     # Vue 3 single-page application
│   ├── src/
│   │   ├── api/client.ts          # HTTP client (fetch wrapper, token handling)
│   │   ├── components/            # Reusable components (PostCard)
│   │   ├── composables/           # Shared state and logic (useAuth)
│   │   ├── i18n/                  # Localization: dictionaries and configuration
│   │   ├── pages/                 # Route pages (Register, Login, Feed)
│   │   ├── router/                # vue-router setup
│   │   ├── App.vue                # App shell: header, language switch
│   │   └── main.ts                # Application entry point
│   └── vite.config.ts
├── server/                     # Elysia API
│   ├── db/
│   │   ├── schema.ts              # Drizzle table definitions
│   │   └── client.ts              # Database connection
│   ├── middleware/
│   │   ├── auth.ts                # JWT plugin
│   │   └── requireAuth.ts         # isAuth guard macro
│   ├── routes/
│   │   ├── auth.ts                # /api/auth/*
│   │   └── posts.ts               # /api/posts
│   └── index.ts                   # Server entry point
├── drizzle/                    # Generated SQL migrations
├── docs/                       # Documentation (this folder) and screenshots
├── .github/workflows/ci.yml    # Continuous integration
├── docker-compose.yml          # PostgreSQL service
└── drizzle.config.ts           # drizzle-kit configuration
```

## Request lifecycle

Example: an authenticated user publishes a post.

1. **Client** — the user submits the form on `/feed` (`FeedPage.vue`).
2. `api.createPost(text)` (`client/src/api/client.ts`) sends `POST /api/posts` with the JSON body and the `Authorization: Bearer <token>` header (the token is read from `localStorage`).
3. **API** — Elysia matches the route in `server/routes/posts.ts`:
   - the `isAuth` macro (`server/middleware/requireAuth.ts`) verifies the token signature and expiry, then puts `userId` into the request context;
   - the `body` schema (`t.Object`) validates `content` (1–500 characters);
   - the handler inserts the row via Drizzle and returns the created post together with its author.
4. **Database** — PostgreSQL stores the row (`posts.user_id` references `users.id` with `ON DELETE CASCADE`).
5. **Response** — the client receives `201` with the post object, adds it to the feed state and Vue re-renders the list (no page reload).

## Server architecture

- **Entry point** (`server/index.ts`): creates the Elysia app, enables CORS, registers the unified error handler, mounts the routers and starts the server on port 3000.
- **Error handling** (`onError`): validation errors → `400` with field details, unknown routes → `404`, malformed JSON → `400`, everything else → `500` (details are logged, never exposed to the client).
- **Middleware**:
  - `auth.ts` — registers the JWT plugin with the secret from `JWT_SECRET`; fails fast at startup if the variable is missing;
  - `requireAuth.ts` — the `isAuth` macro: checks the `Authorization` header, verifies the token and returns `userId` for the handlers. It does not query the database.
- **Routes**:
  - `auth.ts` — registration, login and the protected profile endpoint;
  - `posts.ts` — post creation (protected) and the public feed.

## Client architecture

- **App shell** (`App.vue`): header with the logo, the language switch and the user area (username + logout button, or a link to log in); renders the current page via `<RouterView>`.
- **Routing** (`router/index.ts`): `createWebHistory` router with `/feed`, `/login`, `/register`; `/` redirects to `/feed`.
- **API layer** (`api/client.ts`): a single `request()` wrapper around `fetch` that adds the `Content-Type` header and the bearer token, turns error responses into exceptions and exposes typed methods (`register`, `login`, `me`, `getPosts`, `createPost`).
- **Session state** (`composables/useAuth.ts`): module-level reactive state (`user`, `token`), an `isAuthenticated` computed value and `login`/`logout` methods; the session is mirrored into `localStorage` so it survives reloads.
- **Pages**: `RegisterPage`, `LoginPage`, `FeedPage`; each page talks to the API through the client layer and renders localized strings.
- **Components**: `PostCard` renders a single post (author, time, content) and highlights the current user's own posts.
- **Localization**: all UI strings come from the vue-i18n dictionaries — see [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md).
- **Styling**: a single global stylesheet (`style.css`) with CSS variables (dark theme, wheat accent); no CSS framework.

## Data model

```
users                              posts
─────                              ─────
id             uuid, PK            id          uuid, PK
email          varchar(255), UQ    user_id     uuid, FK → users.id (ON DELETE CASCADE)
username       varchar(50), UQ     content     text
password_hash  text                created_at  timestamptz
created_at     timestamptz
```

- Keys are UUIDs generated by the database (`defaultRandom()`).
- `email` and `username` are unique; duplicates are rejected with `409` (checked in code and enforced by the database).
- Passwords are stored only as argon2id hashes.
- Migrations live in `drizzle/` and are generated from `server/db/schema.ts` by drizzle-kit. Applied migrations are never edited.

## HTTP status codes

| Code  | Meaning in this API                              |
| ----- | ------------------------------------------------ |
| `200` | Successful read                                  |
| `201` | Resource created (user, post)                    |
| `400` | Validation error or malformed JSON               |
| `401` | Missing/invalid/expired token; wrong credentials |
| `404` | Unknown route or missing resource                |
| `409` | Email or username already taken                  |
| `500` | Unexpected server error                          |

Full request/response details: [API.md](API.md).

## Configuration

All configuration is read from the environment (`.env`, not committed):

| Variable                                            | Purpose                                              |
| --------------------------------------------------- | ---------------------------------------------------- |
| `APP_NAME`                                          | Container name prefix (`${APP_NAME}-postgres`)       |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Database credentials created by the container        |
| `DB_PORT`                                           | Host port mapped to PostgreSQL (`5433`)              |
| `JWT_SECRET`                                        | Secret used to sign and verify tokens                |
| `DATABASE_URL`                                      | Connection string used by the server and drizzle-kit |

`.env.example` documents every variable; the full setup is described in [DEVELOPMENT.md](DEVELOPMENT.md).

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main`/`develop` and on every pull request:

1. install server and client dependencies with `--frozen-lockfile`;
2. check formatting (`bun run ci:format`);
3. lint (`bun run lint`);
4. type-check server and client (`bun run typecheck`);
5. build the client (`cd client && bun run build`).

A red CI blocks a pull request from being merged.
