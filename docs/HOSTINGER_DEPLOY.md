# Hostinger Single-Domain Deployment

Deploy this monorepo as one Hostinger Node.js app on `https://opplexify.com`.

- Site: `https://opplexify.com`
- API: same domain, using existing paths like `/health`, `/auth/*`, `/public/*`, `/admin/*`, and `/uploads/*`
- Database: Hostinger MySQL/MariaDB
- Node.js: `24.6.0` or newer on Node 24/26
- Preferred public domain: `https://opplexify.com`
- Canonical redirect target: `https://opplexify.com`

If `npm ci` fails with an unsupported engine error, select Node `24.6.0` or newer in Plesk first. If an old `.node-version` file exists on the server from a previous deploy, delete it after pulling the latest code.

Do not create or use a separate `api.opplexify.com` app for production.

## 0. Source

Use GitHub deployment or upload a ZIP from the repository root. Exclude generated/local folders:

```text
node_modules
.next
dist
playwright-report
test-results
.env
.env.local
```

Install dependencies from the repository root with `npm ci`.

## 1. Hostinger Node App

Create one Node.js app:

| Setting | Value |
| --- | --- |
| Domain | `opplexify.com` |
| Framework | `Other` or `Next.js` |
| Node version | `24.6.0` or newer |
| App root | Repository root |
| Build command | `npm run hostinger:build` |
| Start command | `npm run hostinger:start` |
| Output directory | `.next` |
| Entry file | `main.js` |

The root `main.js` starts Express API routes and Next.js in the same process.

## 2. Environment Variables

Set these on the single `opplexify.com` Node app:

```bash
NODE_ENV=production
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE="u765026793_opplexify"
DB_USERNAME="u765026793_opplexify"
DB_PASSWORD="your-hostinger-database-password"
JWT_SECRET="replace-with-a-long-random-production-secret"
JWT_EXPIRES_IN="365d"
WEB_ORIGIN="https://opplexify.com"
NEXT_PUBLIC_SITE_URL="https://opplexify.com"
CANONICAL_HOST="opplexify.com"
ADMIN_EMAIL="admin@opplexify.com"
ADMIN_PASSWORD="replace-with-a-strong-temporary-admin-password"
```

Leave `NEXT_PUBLIC_API_URL` unset. If Hostinger already has it set to `https://api.opplexify.com`, delete it.

## 3. Production Checks

After deploy/restart, verify:

```text
https://opplexify.com
https://www.opplexify.com
http://opplexify.com
http://www.opplexify.com
https://opplexify.com/health
https://opplexify.com/docs
https://opplexify.com/public/site
https://opplexify.com/admin/login
https://opplexify.com/robots.txt
https://opplexify.com/sitemap.xml
```

Expected health response:

```json
{"ok":true,"service":"opplexify-api"}
```

Expected redirect behavior:

```text
http://opplexify.com        -> 301 https://opplexify.com
http://www.opplexify.com    -> 301 https://opplexify.com
https://www.opplexify.com   -> 301 https://opplexify.com
https://opplexify.com       -> 200 live website
```

If `https://www.opplexify.com` returns `200` instead of redirecting, set the `www` domain alias in Hostinger/Plesk to point to the same Node.js app and enable permanent redirect to the preferred domain. If the Plesk default page appears, remove any separate document-root hosting for the domain or alias and make sure the domain is attached to the Node.js app.

SSL checklist:

- Enable SSL for both `opplexify.com` and `www.opplexify.com`.
- Force HTTPS in Hostinger/Plesk.
- Confirm the Node app receives `X-Forwarded-Proto: https`; otherwise canonical redirects can loop behind a proxy.
- Keep `NEXT_PUBLIC_SITE_URL`, `WEB_ORIGIN`, and `CANONICAL_HOST` set to the apex domain shown above.

Content checklist after deploy:

- Header/footer/contact/legal pages show only `admin@opplexify.com`, `+1 (307) 443-5144`, and `Business mailing address: 525 Randall Ave Ste 100 PMB 1203, Cheyenne, WY 82001, United States`.
- LinkedIn is `https://www.linkedin.com/company/opplexify-llc/`.
- No fake clients, testimonials, stats, team members, office locations, generic social links, crypto/payment wording, or placeholder portfolio labels appear.
- `/team`, `/team/*`, `/work`, `/work/*`, and `/portfolio-grid` redirect to safe public pages.

## 4. Notes

- The API uses Express, not NestJS.
- Uploaded files are stored under `uploads` from the repository root and served at `/uploads/...`.
- Keep `JWT_SECRET` stable between deploys or admin sessions will be invalidated.
- Manage production schema and seed data manually in phpMyAdmin/MySQL unless you intentionally run Prisma migration/seed commands.
- Delete or detach `api.opplexify.com` only after `https://opplexify.com/health` works.
