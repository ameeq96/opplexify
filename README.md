# Opplexify Software Product Lab

A premium agency website and backend for selling websites, web applications, SaaS platforms, mobile apps, and admin dashboards.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript
- Database: Prisma with MySQL
- Auth: JWT admin login

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure the backend:

```bash
cp apps/api/.env.example apps/api/.env
```

3. Update `DATABASE_URL` and `JWT_SECRET` in `apps/api/.env`.

4. Prepare the database:

```bash
npm run prisma:generate
npm run db:push
npm run seed
```

5. Start the apps:

```bash
npm run dev:api
npm run dev:web
```

Frontend runs on `http://localhost:3001`.
Backend runs on `http://localhost:4001/api`.

## Demo Admin

After running the seed script:

- Email: `admin@opplexify.dev`
- Password: `ChangeMe123!`

## Environment

Frontend can call the API through:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4001/api
```

Backend environment variables are documented in `apps/api/.env.example`.

## Hostinger Deployment

Deployment files are included for Hostinger VPS or Hostinger Node.js hosting:

- `server.js` starts the Next.js frontend.
- `server.api.cjs` starts the NestJS API.
- `ecosystem.config.cjs` starts both apps with PM2.
- `HOSTINGER_DEPLOY.md` contains the full deployment steps.

For `opplexify.com` production setup:

```bash
npm install
cp apps/web/.env.production.example apps/web/.env.local
cp apps/api/.env.production.example apps/api/.env
npm run hostinger:setup
npm run start:pm2
```

On Hostinger Business Web Hosting, use two Node.js apps:

- `opplexify.com` -> startup file `server.js`, build command `npm run hostinger:build:web`
- `api.opplexify.com` -> startup file `server.api.cjs`, build command `npm run hostinger:deploy:api`

Static fallback is also available:

```bash
NEXT_PUBLIC_API_URL=https://api.opplexify.com/api npm run hostinger:static
```
