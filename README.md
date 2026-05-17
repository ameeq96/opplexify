# Opplexify Dynamic Platform

Production-ready full-stack conversion scaffold for the Opplexify dark agency template.

## Stack

- Next.js 16 App Router frontend
- Express REST API
- MySQL-compatible database using Prisma's MariaDB driver adapter
- Prisma 7
- JWT auth with role-based admin access

## Setup

Use Node.js `26.1.0` before installing dependencies. This repo uses `.nvmrc` for the target version:

```bash
nvm install
nvm use
```

On Plesk/nodenv, make sure the selected Node runtime is installed on the server before running `npm ci`.

1. Install dependencies:

```bash
npm install
```

2. Create env files:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

3. Start MySQL:

```bash
docker compose up -d mysql
```

4. Generate Prisma client, run migrations, and seed:

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

5. Run API and web:

```bash
npm run start:api
npm run start:web
```

Frontend: http://localhost:3000

API: http://localhost:4000

Swagger: http://localhost:4000/docs

Admin: http://localhost:3000/admin

## Local Seed Admin

- Email: `admin@opplexify.local`
- Password: `Admin123!`

For Hostinger production, create or import the admin user manually in MySQL/phpMyAdmin.

## Hostinger Deployment

The app is prepared for Hostinger Business Web Hosting as one managed Node.js app:

- Site and API: `https://opplexify.com`
- Database: Hostinger MySQL/MariaDB
- Node.js: `26.1.0`

Production scripts:

```bash
npm run hostinger:build
npm run hostinger:start
```

Hostinger deploy does not run database migrations or seed data. Manage production tables and data manually in phpMyAdmin/MySQL.

Full hPanel setup instructions are in [docs/HOSTINGER_DEPLOY.md](docs/HOSTINGER_DEPLOY.md).

## Playwright QA

The repo includes a permanent Playwright QA suite for public pages, responsive checks, portfolio media, contact submission, admin login/modules, admin API CRUD smoke tests, and API health.

Install browser binaries once:

```bash
npx playwright install
```

On Linux, WebKit may also require system packages:

```bash
sudo npx playwright install-deps
```

Run the full QA suite:

```bash
npm run qa:e2e
```

Debug or inspect reports:

```bash
npm run qa:e2e:ui
npm run qa:e2e:report
```

The QA runner starts `npm run start:api` and `npm run start:web` automatically, and reuses existing `127.0.0.1:3000` / `127.0.0.1:4000` servers when they are already running.

## Notes

The original HTML assets from `dark.zip` are copied under `apps/web/public/template-assets/dark/assets`. The app references only clean asset paths and ignores HTTrack placeholder `.html` artifacts.
