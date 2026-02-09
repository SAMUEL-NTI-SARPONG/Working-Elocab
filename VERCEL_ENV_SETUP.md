# 🔧 Vercel Environment Variables Setup

## Critical Fix Applied ✅

The following code changes have been made to fix authentication:
- ✅ Added `axios.defaults.withCredentials = true` in AuthContext.jsx
- ✅ Added `withCredentials: true` to Socket.io connection in SocketContext.jsx
- ✅ Added `transports: ["websocket", "polling"]` for better connection reliability

---

## 📋 BACKEND Environment Variables (elocab-backend)

Go to: **Vercel Dashboard → elocab-backend → Settings → Environment Variables**

Add these **6 variables** (check all 3 environments for each):

```
MONGODB_URI
mongodb+srv://elocab_user:samNsarp.211.mongodb@elocab1.4jhfbza.mongodb.net/elocab?retryWrites=true&w=majority&appName=elocab1

JWT_SECRET
elocab_production_secret_2026_samuel_secure_key_xyz789

NODE_ENV
production

CLIENT_URL
https://elocab.vercel.app

ADMIN_EMAIL
admin@elocab.com

ADMIN_PASSWORD
SecureAdmin@2026
```

---

## 🎨 FRONTEND Environment Variables (elocab)

Go to: **Vercel Dashboard → elocab → Settings → Environment Variables**

Add this **1 variable** (check all 3 environments):

```
VITE_API_URL
https://elocab-backend.vercel.app
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Add Environment Variables

1. Go to https://vercel.com/dashboard
2. **Backend project** (elocab-backend):
   - Settings → Environment Variables
   - Add all 6 variables listed above
   - **IMPORTANT:** Check all 3 boxes (Production, Preview, Development) for each
   - Click Save

3. **Frontend project** (elocab or elocab-app):
   - Settings → Environment Variables
   - Add VITE_API_URL variable
   - **IMPORTANT:** Check all 3 boxes (Production, Preview, Development)
   - Click Save

### Step 2: Deploy Code Changes

The code has been updated. Now commit and deploy:

```bash
git add .
git commit -m "Fix authentication - add credentials support for axios and socket.io"
git push
```

Vercel will automatically redeploy both projects (2-3 minutes).

### Step 3: Manual Redeploy (if auto-deploy doesn't trigger)

1. **Backend**: Vercel Dashboard → elocab-backend → Deployments → Click ⋮ → Redeploy
2. **Frontend**: Vercel Dashboard → elocab → Deployments → Click ⋮ → Redeploy

### Step 4: Test

After deployment completes (wait 3-5 minutes):

1. **Test Registration**: 
   - Go to https://elocab.vercel.app
   - Click "Sign Up"
   - Register as customer or driver
   - Should succeed now ✅

2. **Test Admin Login**:
   - Go to https://elocab.vercel.app/admin/login
   - Email: `admin@elocab.com`
   - Password: `SecureAdmin@2026`
   - Should succeed now ✅

---

## 🔍 Verification Checklist

Before testing, verify:

- [ ] All 6 backend env vars are set on Vercel
- [ ] Frontend VITE_API_URL is set to `https://elocab-backend.vercel.app`
- [ ] Backend CLIENT_URL is set to `https://elocab.vercel.app`
- [ ] All env vars have all 3 environments checked
- [ ] Code changes are pushed to GitHub
- [ ] Vercel shows successful deployment (green checkmark)

---

## 🐛 If Still Not Working

### Check Backend Logs:
1. Vercel Dashboard → elocab-backend → Deployments → Click latest deployment
2. Click "View Function Logs"
3. Look for errors like:
   - "JWT_SECRET is not defined" → JWT_SECRET missing
   - "MongoError" → MONGODB_URI issue
   - "CORS policy" → CLIENT_URL mismatch

### Check Frontend Logs:
1. Open https://elocab.vercel.app
2. Press F12 (Developer Tools)
3. Console tab → Look for errors
4. Network tab → Check failed requests (red ones)
   - If request URL is `http://localhost:5000` → VITE_API_URL not set correctly
   - If CORS error → CLIENT_URL doesn't match frontend URL

### Common Issues:

**❌ 500 Error on /api/auth/register or /api/auth/admin/login**
- Missing JWT_SECRET, ADMIN_EMAIL, or ADMIN_PASSWORD on Vercel backend
- Solution: Add missing env vars and redeploy backend

**❌ CORS Error in Browser Console**
- CLIENT_URL doesn't match frontend URL
- Solution: Update CLIENT_URL to exact frontend URL and redeploy backend

**❌ Network Error or Failed to Fetch**
- VITE_API_URL not set or incorrect on frontend
- Solution: Set VITE_API_URL to `https://elocab-backend.vercel.app` and redeploy frontend

**❌ Requests going to localhost instead of production backend**
- VITE_API_URL not configured on Vercel (only works locally)
- Solution: Must add VITE_API_URL to Vercel dashboard, not just .env file

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Backend health check works: `https://elocab-backend.vercel.app/api/health`
2. ✅ Registration shows success toast message
3. ✅ Login redirects to appropriate dashboard
4. ✅ No CORS errors in browser console
5. ✅ No 500 errors in Network tab
6. ✅ Admin can login with provided credentials

---

## 📞 Support

If problems persist after following all steps:
1. Screenshot the exact error from browser console
2. Check Vercel function logs for backend errors
3. Verify all environment variables are correctly typed (no extra spaces)
4. Ensure CLIENT_URL and VITE_API_URL match your actual deployment URLs
