# Quick Vercel Deployment Checklist ✅

## Step 1: Deploy Backend First
- [ ] Go to Render.com or Railway.app
- [ ] Connect your GitHub repo
- [ ] Set root directory to `server`
- [ ] Add environment variables:
  - `MONGO_URI` (from MongoDB Atlas)
  - `JWT_SECRET` (any secure random string)
  - `PORT=5000`
  - `NODE_ENV=production`
  - `CLIENT_URL=https://your-app.vercel.app` (you'll update this after frontend deployment)
- [ ] Copy your backend URL (e.g., https://elocab-backend.onrender.com)

## Step 2: Deploy Frontend to Vercel
- [ ] Go to Vercel.com
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Settings:
  - Framework: Vite
  - Root Directory: `client`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Add Environment Variable:
  - Name: `VITE_API_URL`
  - Value: `https://your-backend-url.onrender.com` (from Step 1)
- [ ] Deploy!
- [ ] Copy your Vercel URL

## Step 3: Update Backend CORS
- [ ] Go back to Render/Railway
- [ ] Update `CLIENT_URL` environment variable to your Vercel URL
- [ ] Redeploy backend

## Step 4: Test
- [ ] Visit your Vercel app
- [ ] Try registering a user
- [ ] Try logging in
- [ ] Test booking features

## Troubleshooting

### Still getting 404?
- Ensure `vercel.json` exists in client folder ✅ (already added)
- Check Vercel build logs

### API calls failing?
- Verify `VITE_API_URL` is set in Vercel
- Check backend is running
- Verify CORS is configured correctly

### Need to see logs?
- Vercel: Dashboard → Deployments → View logs
- Render: Dashboard → Logs tab

---

**Note**: The 404 error issue is now fixed with:
1. ✅ `vercel.json` - Handles React Router routes
2. ✅ Environment variables - Proper API configuration
3. ✅ CORS setup - Backend accepts frontend requests

Your app is ready to deploy! 🚀
