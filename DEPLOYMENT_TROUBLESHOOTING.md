# Deployment Troubleshooting Guide 🔧

## ❌ Problem: "Login Failed" / "Sign Up Failed" on Deployed App

**Symptom**: Works on localhost but fails on Vercel deployment

**Root Cause**: Frontend is trying to connect to `localhost:5000` instead of your deployed backend

---

## ✅ Solution Checklist

### 1. Check Backend is Deployed

Go to vercel.com → Your backend project

**Expected**: Should see "Ready" status with a domain URL
**If not deployed**: Follow deployment guide Part 2 first

---

### 2. Verify Frontend Environment Variable

Go to vercel.com → Frontend project → Settings → Environment Variables

**Check**: `VITE_API_URL` should be set to your BACKEND URL

- ✅ Correct: `https://elocab-backend-xyz.vercel.app`
- ❌ Wrong: `http://localhost:5000` or blank

**Fix**:

1. Edit the variable
2. Set it to your backend URL
3. Redeploy frontend (Deployments tab → Redeploy)

---

### 3. Verify Backend Environment Variables

Go to vercel.com → Backend project → Settings → Environment Variables

**Must have these 4 variables**:

| Variable      | Value                          | Status                            |
| ------------- | ------------------------------ | --------------------------------- |
| `MONGODB_URI` | Your MongoDB connection string | ✅ Must be set                    |
| `JWT_SECRET`  | Any random string              | ✅ Must be set                    |
| `NODE_ENV`    | `production`                   | ✅ Must be set                    |
| `CLIENT_URL`  | Your frontend Vercel URL       | ✅ Must match actual frontend URL |

**Common mistake**: `CLIENT_URL` still set to `localhost:5173`
**Fix**: Update to `https://your-frontend.vercel.app`

---

### 4. Check CORS Configuration

**Symptom**: Browser console shows CORS error

**Open Browser DevTools** (F12) → Console tab

**If you see**:

```
Access to XMLHttpRequest at 'https://backend...' from origin 'https://frontend...'
has been blocked by CORS policy
```

**Fix**:

1. Go to backend project on Vercel
2. Settings → Environment Variables
3. Verify `CLIENT_URL` = your exact frontend URL
4. Redeploy backend

---

### 5. Check Backend Deployment Logs

Go to vercel.com → Backend project → Deployments → Click latest deployment

**Look for**:

- ✅ "Build Completed"
- ✅ No red error messages
- ✅ Function deployed successfully

**If you see errors**:

- Missing dependencies: Check `package.json`
- MongoDB connection error: Verify `MONGODB_URI`
- Port binding errors: Ignore them (Vercel handles ports automatically)

---

### 6. Test Backend API Directly

Open in browser: `https://your-backend-url.vercel.app/api/auth/login`

**Expected**: Should see something (maybe error message, that's OK)
**If 404**: Backend not deployed correctly

---

### 7. Check Frontend Build Logs

Go to vercel.com → Frontend project → Deployments → Click latest deployment

**Look for**:

- ✅ "Build Completed"
- ✅ No errors about missing VITE_API_URL
- ⚠️ Warning about env variables is OK

---

## 🧪 How to Test After Fixing

### Test 1: Open Browser Console

1. Go to your frontend URL
2. Press F12 → Console tab
3. Try to login/register
4. Look at the Network tab

**What you should see**:

- Request to `https://your-backend.vercel.app/api/auth/...`
- NOT to `localhost:5000`

**If still going to localhost**:

- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Try incognito mode

---

### Test 2: Network Tab

1. F12 → Network tab
2. Try to register/login
3. Look for the API request

**Click on the failed request**:

- **Status 404**: Backend not found (wrong URL)
- **Status 401**: Backend found but authentication failed (different issue)
- **Status CORS error**: CLIENT_URL mismatch
- **Status 500**: Backend error (check backend logs)

---

## 🎯 Most Common Issues & Quick Fixes

### Issue 1: "Network Error" or request goes to localhost

**Cause**: `VITE_API_URL` not set in Vercel

**Fix**:

```
1. Vercel → Frontend → Settings → Environment Variables
2. Add VITE_API_URL = https://your-backend.vercel.app
3. Redeploy frontend
4. Clear browser cache
```

---

### Issue 2: "CORS Error"

**Cause**: Backend `CLIENT_URL` doesn't match frontend URL

**Fix**:

```
1. Vercel → Backend → Settings → Environment Variables
2. Update CLIENT_URL to exact frontend URL (including https://)
3. Redeploy backend
```

---

### Issue 3: Backend deployment failed

**Cause**: Missing `vercel.json` or wrong configuration

**Check**: `server/vercel.json` exists in your repo

**Should contain**:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

---

### Issue 4: MongoDB connection failed

**Cause**: MongoDB Atlas not whitelisted or wrong connection string

**Fix**:

```
1. Go to MongoDB Atlas → Network Access
2. Add 0.0.0.0/0 to allow all IPs
3. Verify MONGODB_URI in Vercel backend settings
```

---

### Issue 5: Everything else works EXCEPT auth

**Symptom**: Can see the site, but login/register fails

**Check**:

1. Browser console for specific error
2. Backend logs on Vercel
3. Try admin login with default credentials
4. Verify JWT_SECRET is set on backend

---

## 📋 Final Checklist

Before asking for help, verify:

- [ ] Backend deployed successfully on Vercel
- [ ] Frontend deployed successfully on Vercel
- [ ] Backend has 4 environment variables set correctly
- [ ] Frontend has VITE_API_URL set to backend URL
- [ ] CLIENT_URL on backend matches frontend URL exactly
- [ ] MongoDB Atlas allows connections from 0.0.0.0/0
- [ ] Cleared browser cache and tried incognito mode
- [ ] Checked browser console (F12) for specific errors
- [ ] Checked Network tab to see where requests are going

---

## 🆘 Emergency Reset

If completely broken:

1. **Delete both Vercel projects**
2. **Redeploy fresh** following DEPLOYMENT.md
3. **Double-check each environment variable**
4. **Test after each step**

---

## 💡 Pro Tips

1. **Always check browser console first** - it shows the exact error
2. **Use incognito mode** - avoids cache issues
3. **Redeploy after changing env vars** - they don't auto-update
4. **Copy-paste URLs exactly** - trailing slash matters!
5. **Wait 30 seconds after deployment** - Vercel needs time to propagate

---

Need more help? Share:

1. Your frontend Vercel URL
2. Your backend Vercel URL
3. Screenshot of browser console error
4. Screenshot of Network tab showing failed request
