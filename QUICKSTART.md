# ELOCAB - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install MongoDB

- Download: https://www.mongodb.com/try/download/community
- Install and run it

### 2. Start Backend Server

```powershell
cd server
npm install
Copy-Item .env.example .env
# Edit .env file with your settings
npm run dev
```

### 3. Start Frontend

```powershell
# Open new terminal window
cd client
npm install
npm run dev
```

### 4. Access Application

- **Homepage:** http://localhost:5173
- **Admin Login:** http://localhost:5173/admin/login
  - Email: admin@elocab.com
  - Password: Admin@2026

## 📸 Adding Images

Place your images in:

- Logo: `client/public/images/logo.png`
- Cars: `client/public/images/cars/`
  - nissan-caravan.jpg
  - toyota-hiace.jpg
  - toyota-voxy.jpg
  - toyota-vitz.jpg

## ✅ You're Ready!

Now you can:

- Register customers and drivers
- Create bookings
- Assign drivers (as admin)
- Track rides in real-time

For detailed instructions, see README.md
