# ELOCAB technical stack

- Node.js 24 verified locally.
- React 18, React Router 7, Vite 8.
- Shared CSS design system with responsive breakpoints, native dialog modals, and locally bundled Manrope / DM Sans fonts.
- Axios and authenticated Socket.IO client.
- Express, Mongoose 8, MongoDB Atlas / replica set, bcrypt, JWT.
- MongoDB transactions for competing driver assignments.
- Scoped Socket.IO user/admin rooms and periodic visible-page refresh.
- Atomic booking statistics and persisted, recoverable archives.
- Node test runner for backend regressions and Playwright for interaction/responsive tests.

See [README.md](README.md) for setup and [AUDIT_AND_REDESIGN.md](AUDIT_AND_REDESIGN.md) for verification.
