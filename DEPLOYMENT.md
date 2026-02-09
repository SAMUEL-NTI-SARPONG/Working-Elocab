# ELOCAB Deployment Guide 🚀

This guide will help you deploy your ELOCAB application to production.

## 📋 Prerequisites

- GitHub account with your code pushed
- Vercel account (for frontend AND backend)
- MongoDB Atlas account (for database)

---

## 🗄️ Part 1: Deploy MongoDB Database

1. **Create MongoDB Atlas Cluster** (if not already done)
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user
   - Whitelist all IP addresses (0.0.0.0/0) for serverless deployments
   - Copy your connection string

---

## 🔙 Part 2: Deploy Backend Server to Vercel

1. **Go to [vercel.com](https://vercel.com)** and login (same account)

2. Click **"Add New Project"**

3. **Import your GitHub repository** (same repo as frontend)

4. **Configure Backend Project**:
   - **Project Name**: `elocab-backend` (or any name you prefer)
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

5. **Add Environment Variables** (click "Environment Variables" before deploying):

   | Key              | Value                                                                                                                           |
   | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
   | `MONGODB_URI`    | `mongodb+srv://elocab_user:samNsarp.211.mongodb@elocab1.4jhfbza.mongodb.net/elocab?retryWrites=true&w=majority&appName=elocab1` |
   | `JWT_SECRET`     | `elocab_production_secret_2026_samuel_secure_key_xyz789`                                                                        |
   | `NODE_ENV`       | `production`                                                                                                                    |
   | `CLIENT_URL`     | `http://localhost:5173` (temporary - will update later)                                                                         |
   | `ADMIN_EMAIL`    | `admin@elocab.com`                                                                                                              |
   | `ADMIN_PASSWORD` | `SecureAdmin@2026`                                                                                                              |

   ⚠️ **IMPORTANT**: Check all 3 environments (Production, Preview, Development) for each variable!

6. Click **"Deploy"**

7. Wait for deployment to complete (2-3 minutes)

8. **Copy your backend URL** from the deployment page
   - Example: `https://elocab-backend.vercel.app` or
   - Example: `https://elocab-backend-abc123.vercel.app`
   - **IMPORTANT**: Copy the full URL - you'll need it for the frontend!

---

## 🎨 Part 3: Deploy Frontend to Vercel

1. Still on **[vercel.com](https://vercel.com)**, click **"Add New Project"** again

2. **Import the SAME GitHub repository** (yes, same repo!)

3. **Configure Frontend Project**:
   - **Project Name**: `elocab-app` (or any name you prefer)
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variable**:
   - Click **"Environment Variables"**
   - Add:

   | Key            | Value                               |
   | -------------- | ----------------------------------- |
   | `VITE_API_URL` | `https://elocab-backend.vercel.app` |

   ⚠️ **IMPORTANT**: Replace with YOUR actual backend URL from Part 2!

5. Click **"Deploy"**

6. Wait for deployment to complete (1-2 minutes)

7. **Copy your frontend URL** from the deployment page
   - Example: `https://elocab-app.vercel.app`

---

## ⚙️ Part 4: Update Backend CORS Settings

Now that both are deployed, connect them:

1. **Go to your BACKEND project** on Vercel dashboard

2. Click **Settings** → **Environment Variables**

3. **Find `CLIENT_URL`** and click **Edit**

4. **Update the value** to your frontend URL from Part 3:

   ```
   https://elocab-app.vercel.app
   ```

   (Replace with YOUR actual frontend URL)

5. Click **Save**

6. Go to **Deployments** tab → Click **"Redeploy"** on the latest deployment

7. Wait 1-2 minutes for redeployment to complete

---

## ✅ Part 5: Test Your Deployment

1. Visit your Vercel URL
2. Try to register a new user
3. Try to login
4. Test all features

### Common Issues:

**❌ 404 Error**

- ✅ Fixed: `vercel.json` is already configured

**❌ API calls failing**

- Check that `VITE_API_URL` is set correctly in Vercel frontend
- Verify your backend is deployed and running
- Check that `CLIENT_URL` is updated in backend settings
- **Common fix**: Redeploy backend after updating `CLIENT_URL`

**❌ Database connection failed**

- Verify MongoDB Atlas connection string in backend environment variables
- Check that IP whitelist includes 0.0.0.0/0
- Ensure variable name is `MONGODB_URI` (not `MONGO_URI`)

**❌ Backend 404 or Function errors**

- Verify `vercel.json` exists in `server` folder
- Check Vercel backend logs for errors

---

## 🔄 Making Updates

### Update Frontend

1. Push changes to GitHub
2. Vercel auto-deploys frontend from `main` branch

### Update Backend

1. Push changes to GitHub
2. Vercel auto-deploys backend from `main` branch

### Update Environment Variables

1. Go to Vercel dashboard
2. Select the project (frontend or backend)
3. Navigate to Settings → Environment Variables
4. Update values
5. Go to Deployments tab → Redeploy latest deployment

---

## 📝 Important Notes

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Always use environment variables** for sensitive data
3. **Backend and Frontend are separate Vercel projects** (same repo, different root directories)
4. **Serverless functions** - Backend uses Vercel serverless (may have slight cold start)
5. **Both are on Vercel FREE tier** - Generous limits for your app size

---

## 🆘 Need Help?

If you encounter any issues:

1. Check Vercel deployment logs (for both frontend and backend projects)
2. Verify all environment variables are set correctly in both projects
3. Ensure MongoDB Atlas is accessible (IP whitelist: 0.0.0.0/0)
4. Check that `CLIENT_URL` matches your actual frontend URL
5. Check that `VITE_API_URL` matches your actual backend URL

---

## 🎉 Success!

Once deployed, you'll have:

- ✅ Frontend: https://elocab-app.vercel.app (your Vercel frontend URL)
- ✅ Backend: https://elocab-backend.vercel.app (your Vercel backend URL)
- ✅ Database: MongoDB Atlas
- ✅ Automatic deployments on git push
- ✅ Everything on Vercel's FREE tier

Enjoy your deployed ELOCAB app! 🚗📱
