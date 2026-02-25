# Authentication Testing Guide 🔐

## ✅ Both Servers are Running

- **Backend**: http://localhost:5000 ✅
- **Frontend**: http://localhost:5173 ✅

---

## 🧪 Test Authentication

### Option 1: Admin Login (Already Created)

Use these credentials to login as admin:

```
Email: <your ADMIN_EMAIL from .env>
Password: <your ADMIN_PASSWORD from .env>
```

**Steps:**

1. Go to http://localhost:5173/admin/login
2. Enter the credentials above
3. Click "Sign in"

---

### Option 2: Register New Customer

1. Go to http://localhost:5173/register
2. Click "Customer" card
3. Fill in the form:
   - Full name: Your Name
   - Email: youremail@example.com
   - Phone: 0244123456
   - City: Kumasi
   - Password: password123
   - Confirm Password: password123
4. Click "Create Account"

---

### Option 3: Register New Driver

1. Go to http://localhost:5173/register
2. Click "Driver" card
3. Fill in the form:
   - Full name: Driver Name
   - Email: driver@example.com
   - Contact: 0244987654
   - Base Location: KNUST
   - Car Type: Sedan/SUV/Hatchback
   - Car Number: GR-1234-20
   - License Number: DL123456
   - Seats: 4
   - Password: password123
   - Confirm Password: password123
4. Click "Create Account"

---

## 🐛 Troubleshooting Authentication Issues

### Issue 1: "Network Error" or "Failed to fetch"

**Cause**: Backend server not running or wrong API URL

**Fix**:

1. Check backend is running: http://localhost:5000
2. Verify `.env` file in `client` folder has:
   ```
   VITE_API_URL=http://localhost:5000
   ```
3. Restart frontend server after changing `.env`

---

### Issue 2: "Invalid credentials"

**Cause**: Email/password mismatch or user doesn't exist

**Fix**:

1. If registering: Make sure passwords match
2. If logging in: Verify you registered this account first
3. For admin: Use exact credentials above

---

### Issue 3: Login works but redirects to wrong page

**Cause**: Role-based routing issue

**Fix**: Check AuthContext routing logic:

- Customer → `/customer/dashboard`
- Driver → `/driver/dashboard`
- Admin → Auto-redirected from admin login page

---

### Issue 4: "401 Unauthorized" after some time

**Cause**: JWT token expired

**Fix**: Logout and login again

---

### Issue 5: CORS Error in console

**Cause**: Backend not allowing frontend origin

**Fix**: Verify `server/server.js` CORS config:

```javascript
cors({
  origin: "http://localhost:5173",
  credentials: true,
});
```

---

## 🧹 Reset Authentication State

If things are completely broken:

1. **Clear localStorage**:
   - Open browser DevTools (F12)
   - Go to Application → Local Storage → http://localhost:5173
   - Delete `elocab_user` and `elocab_token`
   - Refresh page

2. **Restart both servers**:

   ```powershell
   # Kill all node processes
   Get-Process node | Stop-Process -Force

   # Start backend
   cd server
   npm run dev

   # Start frontend (new terminal)
   cd client
   npm run dev
   ```

3. **Clear browser cache**: Ctrl+Shift+Delete → Clear cache

---

## ✨ Quick Test Commands

### Test Backend API Directly:

**Register new user:**

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@test.com","password":"test123","role":"customer","name":"Test User","phoneNumber":"0244123456","city":"Kumasi"}'
```

**Login:**

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@test.com","password":"test123"}'
```

---

## 📝 Common Mistakes

1. ❌ Not restarting frontend after changing `.env`
2. ❌ Using `/login` instead of `/admin/login` for admin
3. ❌ Password less than 6 characters
4. ❌ Trying to login before registering
5. ❌ Backend server not running

---

## ✅ Expected Behavior

**Successful Login Response:**

```json
{
  "_id": "...",
  "email": "user@example.com",
  "role": "customer",
  "profile": {...},
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Successful Registration:**

- Shows success toast
- Auto-logs you in
- Redirects to dashboard based on role

---

Need more help? Check browser console (F12) for error messages! 🔍
