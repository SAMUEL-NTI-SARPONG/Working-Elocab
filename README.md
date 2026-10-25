# ELOCAB

A ride-booking platform for Kumasi, Ghana, with customer, driver, and admin workspaces.

The redesigned application keeps ELOCAB's navy and orange identity and uses a shared responsive interface across the homepage, account pages, booking, ride management, profiles, notifications, and operations tools.

## Run locally

Use Node.js 24 (the version verified for this revision). Install both projects:

```powershell
npm --prefix client ci
npm --prefix server ci
```

Configure `server/.env` from `server/.env.example` with your development MongoDB URI, a private JWT secret, frontend origins, and admin credentials. Use MongoDB Atlas or a local replica set; assignment transactions require replica-set support. Never commit environment files.

For the frontend, create an ignored `client/.env.local` containing:

```env
VITE_API_URL=http://localhost:5000
```

Start each service in a separate terminal:

```powershell
npm --prefix server run dev
npm --prefix client run dev -- --host 127.0.0.1 --strictPort
```

Open [ELOCAB locally](http://127.0.0.1:5173). The [API health endpoint](http://localhost:5000/api/health) must report `dbConnected: true`.

See [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for this workspace's configuration, testing, and deployment notes.

## Accounts and journeys

- Customers register and sign in with a phone number, book dropping or hiring rides, follow progress, cancel eligible rides, and edit their profile.
- Drivers register with vehicle details, choose when to go online, accept assignments, update pickup/completion stages, and review their history.
- Admins sign in at `/admin/login` using the credentials configured in the server environment. They manage people and rides, assign eligible drivers, inspect activity, and archive older records.

The booking flow is **pending → assigned → accepted → on the way → picked up → completed**. Cancellation is available before pickup. Driver assignment checks availability, account status, capacity, and scheduling conflicts.

## Architecture

- **Frontend:** React 18, React Router 7, Vite 8, shared CSS components, locally bundled fonts, Axios, and Socket.IO client.
- **Backend:** Express, Mongoose/MongoDB, JWT authentication, bcrypt password hashing, authenticated Socket.IO rooms, and atomic statistics updates.
- **Archives:** Stored in MongoDB before exported ride records are removed; saved archives can be downloaded again.
- **Updates:** Authenticated sockets where supported, plus periodic dashboard refresh while visible.
- **PWA:** Correctly sized icons and a production service worker; installation stays under the user's control.

## Verify

```powershell
npm --prefix server test
npm --prefix client exec playwright install chromium
npm --prefix client run test:e2e
npm --prefix client run build
npm --prefix client audit
npm --prefix server audit
```

Integration suites require the configured MongoDB connection. They use synthetic accounts in uniquely named temporary test databases, then remove only their own database. They do not use the app's development records.

See [AUDIT_AND_REDESIGN.md](AUDIT_AND_REDESIGN.md) for changes and verification coverage.
