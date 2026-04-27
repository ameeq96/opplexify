# Hostinger Deployment

This project is ready for `opplexify.com` on Hostinger Business Web Hosting with Hostinger Node.js Apps.

Use two Hostinger Node.js apps:

- `opplexify.com` for the Next.js frontend
- `api.opplexify.com` for the NestJS backend API

Production setup for your domain:

- Frontend: `https://opplexify.com`
- Backend API: `https://api.opplexify.com/api`
- Database: Hostinger MySQL
- Web port: `3001`
- API port: `4001`
- Frontend start file: `server.js` or `server.web.cjs`
- API start file: `server.api.cjs`
- PM2 config: `ecosystem.config.cjs`

## 1. Required Server Settings

Use Node.js 20 or newer.

Install dependencies from the project root:

```bash
npm install
```

Create a MySQL database in Hostinger hPanel:

- Go to Databases -> MySQL Databases
- Create a database, database user, and password
- Save the database name, username, password, and host
- Hostinger's database host is usually `localhost`

Create production env files:

```bash
cp apps/web/.env.production.example apps/web/.env.local
cp apps/api/.env.production.example apps/api/.env
```

Edit the values:

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=https://api.opplexify.com/api
```

```bash
# apps/api/.env
NODE_ENV=production
PORT=4001
DATABASE_URL="mysql://hostinger_database_user:hostinger_database_password@localhost:3306/hostinger_database_name"
JWT_SECRET="use-a-long-random-secret"
FRONTEND_URL="https://opplexify.com,https://www.opplexify.com"
```

`NEXT_PUBLIC_API_URL` must be set before building the frontend because Next.js reads it at build time.

## 2. Build And Prepare Database

Run this from the project root:

```bash
npm run hostinger:setup
```

This runs:

- Prisma client generation
- MySQL table setup through Prisma
- Seed data
- Next.js build
- NestJS build

## 3. Start With PM2

If you are on a Hostinger VPS, start both apps with:

```bash
npm install -g pm2
npm run start:pm2
pm2 save
pm2 startup
```

PM2 will run:

- `opplexify-web` on port `3001`
- `opplexify-api` on port `4001`

Restart after env or code changes:

```bash
npm run restart:pm2
```

## 4. Hostinger Business Web Hosting Node.js Apps

Hostinger Business Web Hosting supports managed Node.js apps. Deploy this repo as two separate apps from GitHub or from a `.zip` file.

Create two Node.js apps in hPanel.

Frontend app for `opplexify.com`:

- Application root: project root
- Framework: Next.js, or `Other` if Hostinger does not auto-detect the monorepo
- Startup file: `server.js`
- Build command: `npm run hostinger:build:web`
- Output directory: `.next` if Hostinger asks for one
- Environment variable: `NEXT_PUBLIC_API_URL=https://api.opplexify.com/api`

API app for `api.opplexify.com`:

- Application root: project root
- Framework: NestJS, or `Other` if Hostinger does not auto-detect the monorepo
- Startup file: `server.api.cjs`
- Build command: `npm run hostinger:deploy:api`
- Output directory: `apps/api/dist` if Hostinger asks for one
- Environment variable: `DATABASE_URL=mysql://hostinger_database_user:hostinger_database_password@localhost:3306/hostinger_database_name`
- Environment variable: `JWT_SECRET=use-a-long-random-secret`
- Environment variable: `FRONTEND_URL=https://opplexify.com,https://www.opplexify.com`

The API build command initializes and seeds the MySQL database during deployment. If you ever need to run it manually, use:

```bash
npm run hostinger:init:db
```

## 5. Static Fallback

Use this only if you choose normal file hosting instead of Hostinger's Node.js app feature:

```bash
npm install
NEXT_PUBLIC_API_URL=https://api.opplexify.com/api npm run hostinger:static
```

Upload the contents of:

```bash
apps/web/out
```

to Hostinger `public_html` for `opplexify.com`.

Important: contact forms, quote requests, admin login, and dashboard still need the API at `https://api.opplexify.com/api`. If you do not deploy the API elsewhere, those dynamic features will not save data.

## 6. Health Checks

Check the backend:

```bash
curl https://api.opplexify.com/api/health
```

Expected response:

```json
{
  "ok": true,
  "service": "opplexify-api"
}
```

Check the frontend:

```bash
curl https://opplexify.com
```

## 7. Demo Admin

Seed creates this admin account:

- Email: `admin@opplexify.dev`
- Password: `ChangeMe123!`

Change this password after deployment.

## Notes

The Prisma schema is configured for MySQL. Hostinger Business Web Hosting supports MySQL databases for managed hosting; keep the real `DATABASE_URL` only in Hostinger environment variables or local `.env` files, not in Git.
