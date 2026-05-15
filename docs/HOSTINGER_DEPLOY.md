# Hostinger Business Deployment

This is the direct Hostinger hPanel checklist for deploying the same monorepo as two managed Node.js apps:

- Web: `https://opplexify.com`
- API: `https://api.opplexify.com`
- Database: Hostinger MySQL/MariaDB
- Node.js: `22.x`

Use the repository root as the application root for both Hostinger apps. The API runs at the root of `https://api.opplexify.com`, not under `/backend`.

## 0. Upload Source

Use either GitHub deployment or ZIP upload in Hostinger.

For ZIP upload, include the project source files and exclude generated/local folders:

```text
node_modules
.next
dist
playwright-report
test-results
.env
.env.local
```

Both the web app and API app should point to the same uploaded repository root. They use different build/start commands.

Install dependencies from the repository root. Keep generated folders out of ZIP uploads because Hostinger will build them.

## 1. Create Database

In Hostinger hPanel:

1. Open **Databases -> MySQL Databases**.
2. Create a database, user, and strong password.
3. Copy the database host, name, username, password, and port.
4. Build the production URL:

```bash
mysql://USER:PASSWORD@HOST:3306/DATABASE
```

Keep this value private. It goes only in the API app environment variables.

## 2. Create API App

Create a Node.js Web App for the API.

Recommended settings:

| Setting | Value |
| --- | --- |
| Domain | `api.opplexify.com` |
| Framework | `NestJS` or `Other` |
| Node version | `22.x` |
| App root | Repository root |
| Build command | `npm run hostinger:build:api` |
| Start command | `npm run hostinger:start:api` |
| Output directory | `apps/api/dist` |
| Entry file | `main.js` |

The API start script points directly to the compiled NestJS entry at `apps/api/dist/main.js`. In Hostinger hPanel, keep the output directory as `apps/api/dist` and set the entry file to `main.js`, because the entry file is the file inside the output directory.

API environment variables:

```bash
NODE_ENV=production
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
JWT_SECRET="replace-with-a-long-random-production-secret"
JWT_EXPIRES_IN="7d"
WEB_ORIGIN="https://opplexify.com"
ADMIN_EMAIL="admin@opplexify.com"
ADMIN_PASSWORD="replace-with-a-strong-temporary-admin-password"
```

Do not hardcode `PORT` unless Hostinger support asks for it. The API reads `process.env.PORT` automatically. In production the API fails fast if `DATABASE_URL` or `JWT_SECRET` is missing.

After the API app builds, run migrations:

```bash
npm run hostinger:db:deploy
```

Seed only once on the first production setup:

```bash
npm run hostinger:db:seed
```

Do not run seed on every deploy because it can overwrite CMS-managed production content.

Verify API:

```text
https://api.opplexify.com/health
https://api.opplexify.com/docs
https://api.opplexify.com/public/site
```

## 3. Create Web App

Create a second Node.js Web App for the frontend.

Recommended settings:

| Setting | Value |
| --- | --- |
| Domain | `opplexify.com` |
| Framework | `Next.js` |
| Node version | `22.x` |
| App root | Repository root |
| Build command | `npm run hostinger:build:web` |
| Start command | `npm run hostinger:start:web` |
| Output directory | `apps/web/.next` |

Web environment variables:

```bash
NODE_ENV=production
NEXT_PUBLIC_SITE_URL="https://opplexify.com"
NEXT_PUBLIC_API_URL="https://api.opplexify.com"
```

Verify web:

```text
https://opplexify.com
https://opplexify.com/about
https://opplexify.com/portfolio
https://opplexify.com/services
https://opplexify.com/contact
https://opplexify.com/admin
https://opplexify.com/sitemap.xml
https://opplexify.com/robots.txt
```

## 4. SSL and Domains

Enable SSL for both:

- `opplexify.com`
- `api.opplexify.com`

The frontend must use the HTTPS API URL. If the frontend uses `http://` in production, browser requests can be blocked as mixed content.

Use `opplexify.com` as the canonical frontend domain. If `www.opplexify.com` is enabled, redirect it to `https://opplexify.com` in Hostinger or DNS/CDN settings.

## 5. Production Smoke Test

After both apps are live:

1. Open `https://opplexify.com`.
2. Check `/about`, `/portfolio`, `/services`, and `/contact`.
3. Submit the contact form.
4. Log in at `/admin`.
5. Confirm the contact message appears in admin.
6. Upload one small media file from admin.
7. Confirm the uploaded file renders from `https://api.opplexify.com/uploads/...`.
8. Confirm API health and Swagger open at `https://api.opplexify.com/health` and `https://api.opplexify.com/docs`.

Use the production `ADMIN_EMAIL` and `ADMIN_PASSWORD` values you set before seeding. Change the seeded admin password immediately after the first login.

## 6. Local Pre-Deploy Check

Run before pushing or uploading a deploy:

```bash
npm run hostinger:build:api
npm run hostinger:build:web
npm run build
npm run qa:e2e -- --project=chromium
```

## 7. Notes

- Uploaded files are stored by the API app under `uploads` when started from the repository root.
- Keep `JWT_SECRET` stable between deployments; changing it logs out existing admin sessions.
- Keep `ADMIN_EMAIL` and `ADMIN_PASSWORD` private. They are only used by the production seed command.
- Use `npm run hostinger:db:deploy` for schema updates. Use `npm run hostinger:db:seed` only for the first setup or intentional reset.
- If a deploy fails after migration, redeploy the previous commit/build and inspect Hostinger app logs before retrying.
