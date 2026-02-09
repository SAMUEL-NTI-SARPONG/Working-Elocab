# ELOCAB Deployment Guide 🚀

This guide will help you deploy your ELOCAB application to production.

## 📋 Prerequisites

- GitHub account with your code pushed
- Vercel account (for frontend)
- MongoDB Atlas account (for database)
- Backend hosting account (Render, Railway, or Vercel)

---

## 🗄️ Part 1: Deploy MongoDB Database

1. **Create MongoDB Atlas Cluster** (if not already done)
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user
   - Whitelist all IP addresses (0.0.0.0/0) for serverless deployments
   - Copy your connection string

---

## 🔙 Part 2: Deploy Backend Server

### Option A: Deploy to Render (Recommended - Free Tier)

1. **Go to [render.com](https://render.com)** and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `elocab-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables**:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   CLIENT_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. **Copy your backend URL** (e.g., `https://elocab-backend.onrender.com`)

### Option B: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Set root directory to `server`
5. Add the same environment variables as above
6. Deploy and copy the URL

---

## 🎨 Part 3: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login

2. Click **"Add New Project"**

3. **Import your GitHub repository**

4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variable**:
   - Click **"Environment Variables"**
   - Add: 
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```
   - Replace `your-backend-url.onrender.com` with your actual backend URL from Part 2

6. Click **"Deploy"**

7. Wait for deployment to complete

8. Your app will be live at `https://your-project.vercel.app`

---

## ⚙️ Part 4: Update Backend CORS Settings

After deploying, update your backend to allow requests from your Vercel domain:

1. In your `server/server.js`, update the CORS configuration:
   ```javascript
   const allowedOrigins = [
     'http://localhost:5173',
     'https://your-project.vercel.app'  // Add your Vercel URL
   ];
   ```

2. Commit and push the changes
3. Your backend will auto-redeploy (on Render/Railway)

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
- Check that `VITE_API_URL` is set correctly in Vercel
- Verify your backend is running
- Check backend CORS settings

**❌ Database connection failed**
- Verify MongoDB Atlas connection string
- Check that IP whitelist includes 0.0.0.0/0

---

## 🔄 Making Updates

### Update Frontend
1. Push changes to GitHub
2. Vercel auto-deploys from `main` branch

### Update Backend
1. Push changes to GitHub
2. Render/Railway auto-deploys from `main` branch

### Update Environment Variables
1. Go to Vercel/Render dashboard
2. Navigate to Settings → Environment Variables
3. Update values
4. Trigger a new deployment

---

## 📝 Important Notes

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Always use environment variables** for sensitive data
3. **Backend and Frontend are separate deployments**
4. **Free tiers may sleep after inactivity** - First request might be slow

---

## 🆘 Need Help?

If you encounter any issues:
1. Check Vercel deployment logs
2. Check Render/Railway logs
3. Verify all environment variables are set correctly
4. Ensure MongoDB Atlas is accessible

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Frontend: https://your-project.vercel.app
- ✅ Backend: https://your-backend.onrender.com
- ✅ Database: MongoDB Atlas
- ✅ Automatic deployments on git push

Enjoy your deployed ELOCAB app! 🚗📱
