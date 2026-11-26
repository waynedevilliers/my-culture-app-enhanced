# My Culture App (Next.js)

The replacement for `my-culture-backend` (Express) and `my-culture-frontend`
(Vite + React): one Next.js 16 project with pages and API together. The old
folders stay in the repository as a reference until every page and route has
been moved here.

## Status

| Area | State |
| --- | --- |
| Database schema (Prisma, PostgreSQL) | Done: `prisma/schema.prisma` |
| Admin login (`POST /api/auth/login`), current admin (`GET /api/auth/me`) | Done |
| Health check (`GET /api/health`) | Done |
| All pages and the dashboard (moved from `my-culture-frontend`) | Done, pixel-identical to the old app |
| Other API routes (organisations, events, locations, certificates, newsletter, users) | Not moved yet: those pages show "Request failed with status code 404" until their routes exist |

The pages were moved without changing markup, classes or CSS: Tailwind 3 +
DaisyUI 4 with the same `myCulture` theme. Old and new were compared with
full-page screenshots at 1440x900 and 375x667 on 9 pages (public pages,
dashboard, event and newsletter editors): no pixel differs.

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
src/app/                  routes: (site)/ public pages, dashboard/ admin pages, api/ route handlers
src/views/                page components moved from the old app (was src/pages)
src/components/ sections/ contexts/ hooks/ services/ utils/ schemas/ i18n/
                          moved from the old app unchanged
src/lib/router.tsx        React Router API (Link, NavLink, useNavigate...) on top of
                          Next.js navigation, so moved components work unchanged
src/lib/                  auth, API helpers, validation
tests/                    API tests (Node)
src/tests/                UI tests moved from the old app (jsdom)
```

## Tests

`npm test` runs two Vitest projects: `api` (55 tests) and `ui` (213 tests
moved from the old app). Every UI test that passed in the old app passes
here; 74 UI tests already failed in the old app and still do, in
`CertificateEmailSender`, `validation`, `SecureCertificateViewer`,
`UserFeedback`, `ErrorBoundary`, `Pagination` and `useFormValidation`.
They are fixed in a follow-up.

## Changes made while moving

- `CertificateList.jsx` used `CertificateEmailSender` without importing it,
  and `UserFeedback.jsx` used an icon that does not exist in react-icons 6;
  both crashed when shown.
- Super admins can open the dashboard (before, only `admin` could).
- BlockNote 0.21 to 0.24: 0.21 does not work with React 19, which Next.js 16
  needs. The editor looks the same.
- `react-leaflet` 4 to 5 for React 19.
- The unused sign-up function was removed from `UserContext`.
- `/test-join-us` (a leftover test page) was not moved.
