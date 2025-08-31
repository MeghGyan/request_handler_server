# user_server — API Documentation and Configuration

Express + TypeScript + Prisma (PostgreSQL) service for authentication, conversations, and exchanges.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Setup](#setup)
  - [Environment Variables](#environment-variables)
  - [Install and Build](#install-and-build)
  - [Database (Prisma + PostgreSQL)](#database-prisma--postgresql)
  - [Run](#run)
- [Conventions](#conventions)
  - [Base URL and Routes](#base-url-and-routes)
  - [Authentication](#authentication)
  - [Error Format](#error-format)
  - [Pagination](#pagination)
- [API Reference](#api-reference)
  - [Auth Routes](#auth-routes)
    - [POST /api/auth/v1/signup](#post-apiauthv1signup)
    - [POST /api/auth/v1/login](#post-apiauthv1login)
    - [GET /api/auth/v1/refresh](#get-apiauthv1refresh)
    - [GET /api/auth/v1/me](#get-apiauthv1me)
  - [Conversation Routes](#conversation-routes)
    - [GET /api/conv/v1/getrecentconv](#get-apiconvv1getrecentconv)
  - [Exchange Routes](#exchange-routes)
    - [GET /api/exch/v1/getexch](#get-apiexchv1getexch)
    - [POST /api/exch/v1/createexch](#post-apiexchv1createexch)

---

## Tech Stack

- **Runtime**: Node.js 20+
- **Web**: Express 5
- **Language**: TypeScript 5
- **ORM**: Prisma 6 (provider: PostgreSQL)
- **Auth**: JWT Access/Refresh tokens

---

## Setup

### Environment Variables

Create `.env` in `user_server/`:

```
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public
JWT_ACCESS_SECRET=replace_with_strong_secret
JWT_REFRESH_SECRET=replace_with_strong_secret
```

The server loads these via `src/secret.ts`.

### Install and Build

```bash
npm install
npm run build   # compiles TypeScript to ./dist
```

### Database (Prisma + PostgreSQL)

- Prisma schema: `prisma/schema.prisma` (provider: `postgresql`)
- Generated client output: `generated/prisma`

Initialize DB and generate client:

```bash
npx prisma migrate dev
npx prisma generate
```

### Run

```bash
npm run dev     # runs node ./dist/index.js
```

Root health check: `GET /` → "This is user server!"

---

## Conventions

### Base URL and Routes

All APIs are mounted under `/api`:
- Auth: `/api/auth/v1/*`
- Conversations: `/api/conv/v1/*`
- Exchanges: `/api/exch/v1/*`

### Authentication

- Authenticated routes require header: `Authorization: <access_token>`
  - Note: use the raw JWT string (no `Bearer ` prefix)
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days (rotating)

### Error Format

All errors return this JSON shape with appropriate HTTP status code:

```json
{
  "message": "Human-readable message",
  "errorCode": "STRING_CODE",
  "errors": [
    // Optional detailed validation/context
  ]
}
```

### Pagination

- Fixed page size: `15`
- For routes that accept `page` in request body:
  - `skip = (page - 1) * 15`
  - `take = 15`

---

## API Reference

### Auth Routes

Base: `/api/auth/v1`

#### POST /api/auth/v1/signup

- Description: Create a new user and receive tokens.
- Auth: Not required
- Request (JSON):

```json
{
  "email": "user@example.com",
  "password": "string",
  "username": "string"
}
```

- Response (200):

```json
{
  "id": "<user-id>",
  "email": "user@example.com",
  "username": "string",
  "access_token": "<jwt>",
  "refresh_token": "<jwt>"
}
```

- Error cases:
  - 400 USER_ALREADY_EXISTS
  - 422 validation errors

#### POST /api/auth/v1/login

- Description: Login with credentials.
- Auth: Not required
- Request (JSON):

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

- Response (200):

```json
{
  "id": "<user-id>",
  "email": "user@example.com",
  "username": "string",
  "access_token": "<jwt>",
  "refresh_token": "<jwt>"
}
```

- Error cases:
  - 404 USER_NOT_FOUND
  - 400 INCORRECT_CREDENTIALS
  - 422 validation errors

#### GET /api/auth/v1/refresh

- Description: Rotate refresh token and issue a new access token and refresh token.
- Auth: Not required
- Note: Current implementation expects the refresh token in the request body even for GET.
- Request (JSON body):

```json
{ "refresh_token": "<jwt>" }
```

- Response (200):

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>"
}
```

- Error cases:
  - 401 Missing token
  - 403 Invalid refresh token
  - 403 Refresh token expired
  - 422 TOKEN_ERROR (verification/generation issues)

#### GET /api/auth/v1/me

- Description: Returns the authenticated user (safe shape, no password).
- Auth: Required (`Authorization: <access_token>`)
- Request: no body
- Response (200):

```json
{
  "id": "<user-id>",
  "email": "user@example.com",
  "username": "string",
  "password": null,
  "role": "USER" | "ADMIN",
  "createdAt": "<ISO date>"
}
```

- Error cases:
  - 401 UNAUTHORIZED (missing/invalid token)

---

### Conversation Routes

Base: `/api/conv/v1`

#### GET /api/conv/v1/getrecentconv

- Description: Returns the authenticated user's most recent conversations in descending `updatedAt` order, with pagination.
- Auth: Required (`Authorization: <access_token>`)
- Request (JSON body):

```json
{ "page": 1 }
```

- Response (200):

```json
{
  "conversations": [
    {
      "id": "<conversation-id>",
      "title": "<string|null>",
      "createdAt": "<ISO date>",
      "updatedAt": "<ISO date>",
      "userId": "<user-id>"
    }
  ],
  "pagination": {
    "page": 1,
    "totalCount": 42,
    "totalPages": 3
  }
}
```

- Error cases:
  - 401 UNAUTHORIZED

Note: This endpoint uses a GET route with body. If your client cannot send a body for GET, consider adapting to query params in your integration.

---

### Exchange Routes

Base: `/api/exch/v1`

#### GET /api/exch/v1/getexch

- Description: Returns paginated exchanges for a conversation (newest first).
- Auth: Required (`Authorization: <access_token>`)
- Request (JSON body):

```json
{
  "conversationId": "<conversation-id>",
  "page": 1
}
```

- Response (200):

```json
{
  "exchanges": [
    {
      "id": "<exchange-id>",
      "userQuery": "<string>",
      "systemResponse": "<string>",
      "conversationId": "<conversation-id>",
      "createdAt": "<ISO date>",
      "updatedAt": "<ISO date>"
    }
  ]
}
```

- Error cases:
  - 401 UNAUTHORIZED

Note: This is also a GET route expecting body; some clients may require using query params instead.

#### POST /api/exch/v1/createexch

- Description: Creates an exchange in a conversation, or starts a new conversation if `convId` is not provided. Also updates the conversation's `updatedAt`.
- Auth: Required (`Authorization: <access_token>`)
- Request (JSON):

```json
{
  "user_query": "Hello!",
  "convId": null,
  "convTitle": "A new Title" // optional; default "A new Title" when starting a new conversation
}
```

- Response (200):

```json
{
  "exchange": {
    "id": "<exchange-id>",
    "userQuery": "Hello!",
    "systemResponse": "I am a helpful assistant.",
    "conversationId": "<conversation-id>",
    "createdAt": "<ISO date>",
    "updatedAt": "<ISO date>"
  },
  "conversation": {
    "id": "<conversation-id>",
    "userId": "<user-id>",
    "title": "A new Title",
    "createdAt": "<ISO date>",
    "updatedAt": "<ISO date>"
  }
}
```

Notes:
- `conversation` is non-null only if a new conversation was created.
- `systemResponse` is currently a static placeholder; replace with your LLM/business logic as needed.

- Error cases:
  - 401 UNAUTHORIZED
  - 422 validation errors (if added at schema level for user_query)

---

## Implementation Notes

- Middleware `authMiddleware` reads `Authorization` header as the raw JWT string and attaches `req.user` when valid.
- Errors from controllers are wrapped via `errorHandler`, and formatted by `middlewares/errors.ts`.
- Refresh tokens are stored server-side in `RefreshToken` with expiry and rotated on refresh.

## Tips

- If your client cannot send bodies with GET requests, adapt by passing query params or switch these routes to POST in your integration.
- After changing Prisma models, run:
  - `npx prisma migrate dev`
  - `npx prisma generate`