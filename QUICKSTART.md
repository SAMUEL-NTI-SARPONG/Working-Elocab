# ELOCAB quick start

Read [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for environment configuration.

```powershell
npm --prefix client ci
npm --prefix server ci
```

Set private backend configuration in `server/.env`, and set `VITE_API_URL=http://localhost:5000` in `client/.env.local`.

Run in separate terminals:

```powershell
npm --prefix server run dev
npm --prefix client run dev -- --host 127.0.0.1 --strictPort
```

- App: http://127.0.0.1:5173
- Admin: http://127.0.0.1:5173/admin/login
- Health: http://localhost:5000/api/health

Customer and driver accounts use phone numbers. Admin sign-in uses the credentials in the backend environment. Atlas database credentials are separate from application accounts.
