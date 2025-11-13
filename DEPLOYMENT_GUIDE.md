# 🚀 Complete Deployment Guide - Lectra AI

This guide will walk you through deploying your full-stack application:

- **Backend**: Render (Node.js/Express)
- **Frontend**: Vercel (React)

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ GitHub repository with your code pushed
- ✅ MongoDB Atlas account and connection string
- ✅ Deepgram API key
- ✅ Google Gemini API key
- ✅ Render account (free tier available)
- ✅ Vercel account (free tier available)

---

## 🔧 PART 1: Deploy Backend to Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### Step 2: Create New Web Service

1. Click **"New +"** button
2. Select **"Web Service"**
3. Connect your repository: `Yash-Lalwani/Lectra-AI`
4. Select branch: `main` (or `yash` if that's your main branch)

### Step 3: Configure Service Settings

**Basic Settings:**

```
Name: lectra-ai-backend
Environment: Node
Region: Oregon (US West) [or closest to you]
Branch: main (or your main branch)
```

**Build & Deploy Settings:**

```
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

### Step 4: Add Environment Variables

Click on **"Environment"** tab and add these variables:

```
NODE_ENV = production
PORT = 5000
MONGODB_URI = mongodb+srv://dbUser1:ZhbXBJjxwtEYFq2M@lectra-ai.8ivzyrn.mongodb.net/lectra
JWT_SECRET = Qx7sM4Jp!tY9zF2uVw@cH8rLbD6kN1e
JWT_EXPIRES_IN = 7d
DEEPGRAM_API_KEY = your-deepgram-api-key-here
GEMINI_API_KEY = AIzaSyDLCsU6HjvxmeU-qN6QmSSpfitFUizXEOA
UPLOAD_PATH = ./uploads
PDF_PATH = ./pdfs
FRONTEND_URL = https://your-frontend-url.vercel.app
```

**⚠️ Important Notes:**

- Replace `your-deepgram-api-key-here` with your actual Deepgram API key
- Replace `https://your-frontend-url.vercel.app` with your actual Vercel URL (we'll update this after frontend deployment)
- Keep `FRONTEND_URL` as a placeholder for now, we'll update it later

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. **Copy your backend URL** (e.g., `https://lectra-ai-backend.onrender.com`)
4. Test the health endpoint: `https://your-backend-url.onrender.com/health`

---

## 🎨 PART 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your repository: `Yash-Lalwani/Lectra-AI`
3. Select the repository

### Step 3: Configure Project Settings

**Framework Preset:**

```
Framework Preset: Create React App
```

**Build Settings:**

```
Root Directory: frontend
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### Step 4: Add Environment Variables

Click on **"Environment Variables"** and add:

```
REACT_APP_API_URL = https://your-backend-url.onrender.com
REACT_APP_SOCKET_URL = https://your-backend-url.onrender.com
```

**⚠️ Important:**

- Replace `https://your-backend-url.onrender.com` with your actual Render backend URL from Part 1
- Use the same URL for both variables (backend handles both REST API and WebSocket)

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (2-5 minutes)
3. **Copy your frontend URL** (e.g., `https://lectra-ai.vercel.app`)

---

## 🔗 PART 3: Connect Frontend and Backend

### Step 1: Update Backend CORS (Render)

Now that you have your frontend URL, update the backend:

1. Go back to Render dashboard
2. Open your `lectra-ai-backend` service
3. Go to **"Environment"** tab
4. Find `FRONTEND_URL` variable
5. Update it to your actual Vercel URL: `https://your-frontend-url.vercel.app`
6. Click **"Save Changes"**
7. Render will automatically redeploy

### Step 2: Verify Connection

1. Open your frontend URL in browser
2. Open browser DevTools (F12) → Console tab
3. Try to login or register
4. Check for any CORS errors
5. Test Socket.IO connection (should see "Connected to server" in console)

---

## ✅ PART 4: Testing Your Deployment

### Test Backend

1. Health Check: `https://your-backend-url.onrender.com/health`
   - Should return: `{"status":"healthy","timestamp":"..."}`

### Test Frontend

1. Open: `https://your-frontend-url.vercel.app`
2. Try to register a new account
3. Try to login
4. Check browser console for errors

### Test Full Flow

1. Login as teacher
2. Create a lecture
3. Start recording
4. Check if notes are generated
5. Test Socket.IO real-time features

---

## 🔍 Troubleshooting

### Backend Issues

**Problem: Build fails with `npm ci` error**

- **Solution**: Use `npm install` as build command (already configured above)

**Problem: Deployment stuck on "Building"**

- **Solution**:
  1. Cancel deployment
  2. Check logs for errors
  3. Verify all environment variables are set
  4. Try deploying again

**Problem: CORS errors**

- **Solution**:
  1. Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
  2. Make sure URL includes `https://` and no trailing slash
  3. Redeploy backend after updating

**Problem: MongoDB connection fails**

- **Solution**:
  1. Check MongoDB Atlas network access (allow 0.0.0.0/0)
  2. Verify connection string is correct
  3. Check MongoDB Atlas cluster is running

### Frontend Issues

**Problem: API calls fail (404 or CORS)**

- **Solution**:
  1. Verify `REACT_APP_API_URL` is set correctly in Vercel
  2. Make sure URL includes `https://` and no trailing slash
  3. Redeploy frontend after updating

**Problem: Socket.IO connection fails**

- **Solution**:
  1. Verify `REACT_APP_SOCKET_URL` is set correctly
  2. Check backend Socket.IO CORS configuration
  3. Check browser console for specific errors

**Problem: Build fails on Vercel**

- **Solution**:
  1. Check build logs in Vercel dashboard
  2. Verify `package.json` has correct build script
  3. Make sure all dependencies are in `package.json`

---

## 📝 Environment Variables Summary

### Backend (Render) - Required Variables:

```
NODE_ENV = production
PORT = 5000
MONGODB_URI = your-mongodb-connection-string
JWT_SECRET = your-jwt-secret-key
JWT_EXPIRES_IN = 7d
DEEPGRAM_API_KEY = your-deepgram-key
GEMINI_API_KEY = your-gemini-key
UPLOAD_PATH = ./uploads
PDF_PATH = ./pdfs
FRONTEND_URL = https://your-frontend-url.vercel.app
```

### Frontend (Vercel) - Required Variables:

```
REACT_APP_API_URL = https://your-backend-url.onrender.com
REACT_APP_SOCKET_URL = https://your-backend-url.onrender.com
```

---

## 🎯 Quick Reference URLs

After deployment, you'll have:

- **Backend API**: `https://lectra-ai-backend.onrender.com`
- **Frontend App**: `https://lectra-ai.vercel.app`
- **Health Check**: `https://lectra-ai-backend.onrender.com/health`

---

## 🚨 Important Notes

1. **Render Free Tier**:

   - Services sleep after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds
   - Consider upgrading for production use

2. **Vercel Free Tier**:

   - 100GB bandwidth/month
   - Unlimited deployments
   - Perfect for production

3. **MongoDB Atlas Free Tier**:

   - 512MB storage
   - Shared cluster
   - Sufficient for development/small production

4. **Environment Variables**:
   - Never commit `.env` files to GitHub
   - Always set variables in platform dashboards
   - Use strong, unique values for `JWT_SECRET`

---

## 🎉 You're Done!

Your application should now be live and accessible from anywhere!

**Next Steps:**

1. Test all features thoroughly
2. Set up custom domains (optional)
3. Monitor logs for any issues
4. Consider upgrading plans for production use

---

## 📞 Need Help?

If you encounter issues:

1. Check the logs in Render/Vercel dashboards
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Test API endpoints directly using Postman/curl

Good luck with your deployment! 🚀
