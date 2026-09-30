# API reference

Base URL: `http://localhost:3000`. All request and response bodies are JSON (`Content-Type: application/json`).

## Authentication

Registration and login are public; endpoints that need the current user require a JWT:

```
Authorization: Bearer <token>
```

Tokens are issued at login and live for **7 days**. The token payload contains `userId`.

## Errors

All errors have a single `error` field; validation errors add `field` and `message`:

```json
{
  "error": "Invalid data",
  "field": "email",
  "message": "Expected string to match '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'"
}
```

| Status | When                                                                                                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | Validation failed (`Invalid data`) or malformed JSON (`Malformed JSON in request body`)                                           |
| `401`  | Missing/invalid/expired token (`Token is missing`, `Invalid or expired token`) or wrong credentials (`Invalid email or password`) |
| `404`  | Unknown route (`Route not found`) or a missing user in `/me`                                                                      |
| `409`  | `email is already taken`, `username is already taken`                                                                             |
| `500`  | Unexpected error (`Server error`)                                                                                                 |

## Endpoints

### `GET /api/hello`

Health check.

**Response `200`**

```json
{ "message": "Server is running!" }
```

### `POST /api/auth/register`

Creates an account.

**Body**

| Field      | Rules                                        |
| ---------- | -------------------------------------------- |
| `email`    | string, matches `^[^\s@]+@[^\s@]+\.[^\s@]+$` |
| `username` | string, 3–50 characters                      |
| `password` | string, 6–100 characters                     |

**Response `201`** — the created user (never the password hash):

```json
{
  "id": "0fcb9d2b-0132-434f-ad19-bad7f0ca407e",
  "email": "test@example.com",
  "username": "testuser",
  "createdAt": "2026-09-16T08:42:18.837Z"
}
```

**Errors** — `400` (validation), `409` (`email is already taken`, `username is already taken`).

### `POST /api/auth/login`

Verifies credentials and issues a JWT.

**Body**

| Field      | Rules                            |
| ---------- | -------------------------------- |
| `email`    | the same pattern as registration |
| `password` | string, 6–100 characters         |

**Response `200`**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "email": "test@example.com", "username": "testuser" }
}
```

**Errors** — `401 Invalid email or password` (the same message for an unknown email and a wrong password, so the API does not reveal whether an account exists).

### `GET /api/auth/me`

Returns the current user profile. **Requires a token.**

**Response `200`**

```json
{
  "id": "...",
  "email": "test@example.com",
  "username": "testuser",
  "createdAt": "2026-09-16T08:42:18.837Z"
}
```

**Errors** — `401` (no/invalid token), `404 User not found` (a valid token whose user no longer exists).

### `POST /api/posts`

Creates a post on behalf of the authenticated user. **Requires a token.** The author is taken from the token, not from the body.

**Body**

| Field     | Rules                    |
| --------- | ------------------------ |
| `content` | string, 1–500 characters |

**Response `201`**

```json
{
  "id": "55c17499-df52-4c8c-8ac4-a9f910923aa1",
  "userId": "0fcb9d2b-0132-434f-ad19-bad7f0ca407e",
  "content": "Hello from the rebuild guide!",
  "createdAt": "2026-09-16T08:59:48.574Z",
  "author": { "id": "0fcb9d2b-...", "username": "testuser" }
}
```

**Errors** — `400` (validation), `401` (no/invalid token).

### `GET /api/posts`

Public feed: the latest 50 posts, newest first. Does not require a token.

**Response `200`**

```json
[
  {
    "id": "...",
    "userId": "...",
    "content": "Hello!",
    "createdAt": "2026-09-16T08:59:48.574Z",
    "author": { "id": "...", "username": "testuser" }
  }
]
```

`author` can be `null` if the author's account was deleted (the query uses a `LEFT JOIN`).

## Examples

Registration (PowerShell — the body is written to a file because PowerShell mangles quotes in inline JSON):

```powershell
$body = @{ email = "test@example.com"; username = "testuser"; password = "secret123" } | ConvertTo-Json
[System.IO.File]::WriteAllText("$env:TEMP\register.json", $body)

curl.exe -s -w " [%{http_code}]" -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" --data-binary "@$env:TEMP/register.json"
```

Login and a request with the token:

```powershell
$login = @{ email = "test@example.com"; password = "secret123" } | ConvertTo-Json
[System.IO.File]::WriteAllText("$env:TEMP\login.json", $login)

$token = (curl.exe -s -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" --data-binary "@$env:TEMP/login.json" | ConvertFrom-Json).token

curl.exe -s -w " [%{http_code}]" http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer $token"
```

Any HTTP client works (Postman, Insomnia, httpie). Postman ignores CORS, so it is convenient for debugging the API separately from the browser.
