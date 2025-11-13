# 🚀 Lectra AI Deployment Guide

## Overview

This guide will help you deploy your Lectra AI application to production using Render (backend) and Vercel (frontend).

## Prerequisites

- GitHub account with your code pushed
- MongoDB Atlas account
- Deepgram API key
- Google Gemini API key

## Step 1: Backend Deployment (Render)

### 1.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub account

### 1.2 Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your repository: `Lectra-AI`

### 1.3 Configure Service

- **Name**: `lectra-backend`
- **Environment**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: `backend`

### 1.4 Environment Variables

Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://dbUser1:ZhbXBJjxwtEYFq2M@lectra-ai.8ivzyrn.mongodb.net/lectra-production
JWT_SECRET=Qx7sM4Jp!tY9zF2uVw@cH8rLbD6kN1e
JWT_EXPIRES_IN=7d
DEEPGRAM_API_KEY=your-deepgram-api-key
GEMINI_API_KEY=AIzaSyDLCsU6HjvxmeU-qN6QmSSpfitFUizXEOA
UPLOAD_PATH=./uploads
PDF_PATH=./pdfs
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 1.5 Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL (e.g., `https://lectra-backend.onrender.com`)

## Step 2: Frontend Deployment (Vercel)

### 2.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Connect your GitHub account

### 2.2 Import Project

1. Click "New Project"
2. Import your GitHub repository
3. Select your repository: `Lectra-AI`

### 2.3 Configure Build Settings

- **Framework Preset**: `Create React App`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### 2.4 Environment Variables

Add these environment variables in Vercel dashboard:

```
REACT_APP_API_URL=https://your-backend-domain.onrender.com
REACT_APP_SOCKET_URL=https://your-backend-domain.onrender.com
GENERATE_SOURCEMAP=false
```

### 2.5 Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Note your frontend URL (e.g., `https://lectra-ai.vercel.app`)

## Step 3: Update Configuration

### 3.1 Update Backend CORS

1. Go to Render dashboard
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy the backend

### 3.2 Update Frontend API URLs

1. Go to Vercel dashboard
2. Update environment variables with your Render backend URL
3. Redeploy the frontend

## Step 4: MongoDB Atlas Setup

### 4.1 Create Production Database

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster for production
3. Create a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for Render

### 4.2 Update Connection String

1. Get your production connection string
2. Update `MONGODB_URI` in Render environment variables
3. Redeploy backend

## Step 5: Testing

### 5.1 Health Check

Visit: `https://your-backend-domain.onrender.com/health`

### 5.2 Full Application Test

1. Visit your frontend URL
2. Test user registration/login
3. Test lecture creation and real-time features
4. Test file uploads and downloads

## Step 6: Custom Domain (Optional)

### 6.1 Backend Domain

1. In Render dashboard, go to Settings → Custom Domains
2. Add your custom domain
3. Update DNS records as instructed

### 6.2 Frontend Domain

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Ensure `FRONTEND_URL` in backend matches your frontend domain
   - Check that both URLs use HTTPS

2. **Socket.IO Connection Issues**

   - Verify `REACT_APP_SOCKET_URL` points to your backend
   - Check that WebSocket connections are allowed

3. **File Upload Issues**

   - Render has ephemeral file system
   - Consider using AWS S3 for persistent storage

4. **Environment Variables**
   - Double-check all environment variables are set correctly
   - Ensure no typos in variable names

### Monitoring

1. **Render Logs**

   - Check Render dashboard for application logs
   - Monitor resource usage

2. **Vercel Analytics**
   - Enable Vercel Analytics for frontend monitoring
   - Check deployment logs

## Security Considerations

1. **API Keys**

   - Never commit API keys to repository
   - Use environment variables only
   - Rotate keys regularly

2. **Database Security**

   - Use strong database passwords
   - Limit IP access in MongoDB Atlas
   - Enable database authentication

3. **HTTPS**
   - Both Render and Vercel provide HTTPS by default
   - Use HTTPS URLs in all configurations

## Cost Optimization

1. **Render**

   - Free tier available for small applications
   - Consider paid plans for production use

2. **Vercel**

   - Free tier with generous limits
   - Pro plan for advanced features

3. **MongoDB Atlas**
   - Free tier available
   - Pay-as-you-go pricing

## Next Steps

1. Set up monitoring and alerting
2. Configure automated backups
3. Implement CI/CD pipelines
4. Add performance monitoring
5. Set up error tracking (Sentry)

Your Lectra AI application is now live and ready for production use! 🎉
