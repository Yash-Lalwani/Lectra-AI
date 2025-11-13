# ✅ Deployment Checklist

Use this checklist to ensure everything is set up correctly.

## 🔧 Backend (Render) Setup

### Initial Setup
- [ ] Created Render account
- [ ] Connected GitHub repository
- [ ] Created new Web Service

### Configuration
- [ ] Name: `lectra-ai-backend`
- [ ] Environment: `Node`
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Branch: `main` (or your main branch)

### Environment Variables (Render)
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `MONGODB_URI` = (your MongoDB connection string)
- [ ] `JWT_SECRET` = (strong random string)
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `DEEPGRAM_API_KEY` = (your Deepgram key)
- [ ] `GEMINI_API_KEY` = (your Gemini key)
- [ ] `UPLOAD_PATH` = `./uploads`
- [ ] `PDF_PATH` = `./pdfs`
- [ ] `FRONTEND_URL` = (placeholder for now, update after frontend deploy)

### Deployment
- [ ] Backend deployed successfully
- [ ] Backend URL copied: `https://________________.onrender.com`
- [ ] Health check works: `/health` endpoint returns success

---

## 🎨 Frontend (Vercel) Setup

### Initial Setup
- [ ] Created Vercel account
- [ ] Connected GitHub repository
- [ ] Imported project

### Configuration
- [ ] Framework Preset: `Create React App`
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `build`
- [ ] Install Command: `npm install`

### Environment Variables (Vercel)
- [ ] `REACT_APP_API_URL` = (your Render backend URL)
- [ ] `REACT_APP_SOCKET_URL` = (your Render backend URL)

### Deployment
- [ ] Frontend deployed successfully
- [ ] Frontend URL copied: `https://________________.vercel.app`

---

## 🔗 Connection & Testing

### Update Backend CORS
- [ ] Updated `FRONTEND_URL` in Render with actual Vercel URL
- [ ] Backend redeployed after CORS update

### Testing
- [ ] Frontend loads without errors
- [ ] Can register new account
- [ ] Can login with existing account
- [ ] API calls work (check browser Network tab)
- [ ] Socket.IO connects (check browser Console)
- [ ] No CORS errors in console
- [ ] Real-time features work (notes, polls, etc.)

---

## 📋 Pre-Deployment Checklist

### Code
- [ ] All code pushed to GitHub
- [ ] No `.env` files committed
- [ ] `package.json` files are correct
- [ ] No hardcoded localhost URLs in code

### API Keys
- [ ] MongoDB Atlas connection string ready
- [ ] Deepgram API key ready
- [ ] Gemini API key ready
- [ ] JWT secret generated (strong random string)

### Accounts
- [ ] Render account created
- [ ] Vercel account created
- [ ] MongoDB Atlas account ready

---

## 🎯 Post-Deployment

- [ ] Tested all major features
- [ ] Checked logs for errors
- [ ] Verified environment variables are set
- [ ] Tested on different devices/browsers
- [ ] Shared URLs with team/users

---

## 🚨 Common Issues to Check

- [ ] Backend build command is `npm install` (not `npm ci`)
- [ ] Frontend environment variables start with `REACT_APP_`
- [ ] Backend `FRONTEND_URL` matches frontend URL exactly
- [ ] MongoDB Atlas network access allows all IPs (0.0.0.0/0)
- [ ] All API keys are correct and active
- [ ] No trailing slashes in URLs

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Deployment Date**: _______________

**Backend URL**: `https://________________.onrender.com`

**Frontend URL**: `https://________________.vercel.app`
