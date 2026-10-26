# Local development

The repository has two separate npm projects:

- `client/`: React, Vite, Tailwind CSS, and Socket.IO client.
- `server/`: Express, Mongoose, JWT authentication, and Socket.IO server.

## Install dependencies

Run these commands from the repository root. The existing lockfiles let
`npm ci` install the same dependency versions for each checkout.

```powershell
npm --prefix client ci
npm --prefix server ci
```

## Configure the environment

This workspace has ignored `client/.env.local` and `server/.env` files prepared
for development. The backend file contains generated local secrets. Keep these
files private; do not commit them.

The frontend uses `VITE_API_URL=http://localhost:5000` for both HTTP requests
and Socket.IO. The backend uses port `5000` and allows the local frontend at
`http://localhost:5173` and `http://127.0.0.1:5173`.

The backend is configured to connect to the `elocab_dev` database on the
existing Atlas cluster `elocab1`, using database user `elocab_user`. The full
connection string, including the encoded password, is stored only in the ignored
`server/.env` file. The temporary password entry in `server/.env.local` has been
cleared. A local MongoDB installation is not required.

For a local MongoDB alternative, run a MongoDB replica set and set `MONGODB_URI`
to its connection string. Driver assignment uses transactions to prevent
overlapping assignments; a standalone MongoDB instance is insufficient. Restart the
backend after changing its environment. Restart Vite after changing the
frontend environment.

Use a development database for local work. Automatic monthly archiving is opt-in:
set `ENABLE_ARCHIVE_SCHEDULER=true` on a persistent Node server to enable it.
Archives are saved in MongoDB before the corresponding ride records are removed.

## Run the app

Open two terminals at the repository root:

```powershell
# Terminal 1: API
npm --prefix server run dev
```

```powershell
# Terminal 2: frontend
npm --prefix client run dev -- --host 127.0.0.1 --strictPort
```

- Frontend: http://127.0.0.1:5173
- Admin login: http://127.0.0.1:5173/admin/login
- API health: http://localhost:5000/api/health

The health response must show `dbConnected: true` before testing registration,
login, bookings, or dashboards. An HTTP 200 health response by itself only
confirms that the API process is listening.

## Checks

```powershell
npm --prefix client run build
npm --prefix server test
npm --prefix client run test:e2e
```

Both test suites require a configured MongoDB connection. They create separate
`elocab_test_<random>` databases, use synthetic accounts, and remove only their
own temporary database afterward. The browser suite starts its own services on
ports 5112 and 5174; the API suite uses port 5111. Install Chromium once with
`npm --prefix client exec playwright install chromium` before browser tests.

Customer and driver accounts use phone numbers for authentication. The admin
sign-in uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the ignored `server/.env`;
these are not the Atlas database credentials. New account passwords require
at least eight characters. Customer phone edits update the sign-in identifier;
driver contact edits leave the sign-in number unchanged.

## Deployment configuration

Set `CLIENT_URL` to the exact frontend origin, or a comma-separated list of
origins. CORS rejects other origins. Set a private `JWT_SECRET`, database URI,
and admin bootstrap credentials in the deployment environment. Bootstrap only
creates an admin after the configured password has been verified.

For an existing admin, the database password hash is authoritative: changing
`ADMIN_PASSWORD` does not replace it. To recover access, run
`node scripts/resetAdmin.js` from `server/` with the intended database URI,
`ADMIN_EMAIL`, and `ADMIN_PASSWORD` configured. It updates the existing account
without deleting it or changing its ID. Never publish these environment values.

Phone numbers identify one account and role. Driver registration requires a
separate unused phone number if the person already has a customer account.
Vehicle and driving licence numbers must also be unique. Conflicts now identify
the specific field and point the person toward their existing account.

Socket.IO authenticates with the same JWT and sends private booking events only
to the relevant customer, driver, and admins. A persistent Node host is required
for persistent socket connections. The dashboards also refresh every 30 seconds
while visible, supporting deployments where sockets are unavailable. Desktop
alerts are opt-in and work while the app is open; Web Push delivery while the
app is closed is not configured.

## Preparation baseline

- Prepared on October 25, 2026 from `origin/main` at `d2a7dac`.
- Working branch: `codex/project-preparation`.
- Installed both packages using the existing dependency lockfiles.
- The redesigned frontend builds with Vite 8 and lazy-loaded routes. The main
  JavaScript bundle is approximately 292 kB minified, down from about 529 kB.
- Both dependency audits report zero known vulnerabilities after updates.
- Fonts are bundled locally, with no Google Fonts request required at runtime.
- Atlas authentication and a database ping pass for `elocab_dev`.
- The backend starts and `/api/health` returns HTTP 200 with
  `dbConnected: true`, both directly and through the Vite API proxy.
- The frontend and Socket.IO polling handshake return HTTP 200.
- The API regression suite passes role/access, account/password, phone updates,
  booking lifecycle, assignment concurrency, notification/socket authentication,
  and recoverable archive checks.
