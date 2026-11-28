# My Culture App

Platform of Culture Academy e. V. (grow) for cultural organisations: public organisation pages, a Join us application, and certificates that organisations issue to their members through private, revocable links.

## Repository layout

| Folder | What it is |
| --- | --- |
| [`my-culture-app/`](my-culture-app/) | **The app.** One Next.js project with pages and API together (Prisma + PostgreSQL). This is what runs in production. |
| [`legacy/`](legacy/) | The previous Express backend (`my-culture-backend`) and Vite frontend (`my-culture-frontend`), plus their deploy script. Not in use; kept for reference only. |

Everything about setup, development, tests and deployment is in [`my-culture-app/README.md`](my-culture-app/README.md).

## Quick start

```bash
cd my-culture-app
npm install
cp .env.example .env   # then fill in DATABASE_URL and JWT_SECRET
npm run dev            # http://localhost:3000
```

## Production

- App: https://my-culture-app.vercel.app (Vercel project `my-culture-app`, root directory `my-culture-app`)
- Pull requests get a preview deployment; `main` deploys to production.

## Contributing

Work on a feature branch, open a pull request against `main`, and use Conventional Commits (`feat:`, `fix:`, `docs:` …). CI (lint and types, unit tests, audit, end-to-end tests) must pass before merging.
