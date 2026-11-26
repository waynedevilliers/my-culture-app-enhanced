# My Culture App (Next.js)

The replacement for `my-culture-backend` (Express) and `my-culture-frontend`
(Vite + React): one Next.js 16 project with pages and API together. The old
folders stay in the repository as a reference until every page and route has
been moved here.

## Status

| Area | State |
| --- | --- |
| Database schema (Prisma, PostgreSQL) | Done: `prisma/schema.prisma` |
| Admin login (`POST /api/auth/login`) | Done |
| Current admin (`GET /api/auth/me`) | Done |
| Health check (`GET /api/health`) | Done |
| Pages and the other API routes | Not moved yet |

## Who can log in

Only admins and super admins. There is no public sign-up: visitors browse
organisations, apply through "Join us" and open certificates through their
private link, without an account. Any other account gets the same "Invalid
email or password" answer as a wrong password.

## How login works

1. `POST /api/auth/login` with `{ "email", "password" }` returns a token
   (valid 7 days).
2. The client sends it as `Authorization: Bearer <token>`.
3. `src/proxy.ts` checks the token and role for every protected `/api` route
   (`PROTECTED_ROUTES`), removes any `x-user-*` headers a client sent, and
   passes the verified user to the route handler as `x-user-id`,
   `x-user-email` and `x-user-role`.
4. Route handlers read them with `extractUserFromHeaders` from `src/lib/api.ts`.

`JWT_SECRET` has no default: without it (or if it is shorter than 32
characters) no token can be signed or verified.

## Setup

```bash
cd my-culture-app
npm ci
cp .env.example .env.local      # fill in DATABASE_URL and JWT_SECRET
npm run db:push                 # create the tables
SEED_ADMIN_PASSWORD='...' npm run prisma:seed   # optional sample data and super admin
npm run dev                     # http://localhost:3000
```

The seed can be run more than once without creating duplicates, and never
changes an existing admin's password.

## Checks

```bash
npm test             # Vitest, no database or server needed (Prisma is mocked)
npx tsc --noEmit     # types
npm run lint         # ESLint
npm run build        # production build
```

## Layout

```
prisma/schema.prisma      database tables
prisma/seed.ts            sample data
src/proxy.ts              auth and role check for /api routes
src/app/api/              route handlers
src/lib/auth.ts           tokens and password hashing
src/lib/api.ts            response helpers
src/lib/validation.ts     Zod schemas
tests/                    Vitest tests
```
