# 🔧 Troubleshooting Guide

## Frontend Routing Issues

### Problem: "Page Not Found" when navigating to routes like `/dashboard` or `/select-professor`

**Cause**: React Router routes are client-side, but the server is trying to find those files on the server.

**Solution 1: Configure Render Static Site (Recommended)**

1. Go to Render → Your frontend Static Site
2. Click **Settings** → **Redirects/Rewrites**
3. Add a rewrite rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Type**: `Rewrite`
4. Save and redeploy

**Solution 2: Use \_redirects file (Already created)**

✅ I've created `frontend/public/_redirects` with:

```
/*    /index.html   200
```

This file will be copied to your build folder. After deploying, it should work.

**Solution 3: Manual Fix in Render Dashboard**

1. Go to Render → Your frontend Static Site
2. Click **Settings**
3. Look for **"Redirects"** or **"Headers"** section
4. Add: All routes (`/*`) should serve `/index.html`

**After Fix:**

1. Commit and push the `_redirects` file
2. Redeploy frontend on Render
3. Test navigation to `/dashboard` and `/select-professor`

---

## Backend Issues

### Problem: Backend returns "Route not found"

**Solution:**

1. ✅ **Fixed in code** - Added root route to server.js
2. **Commit and push** the changes to GitHub
3. **Redeploy** on Render (it should auto
   -deploy, or manually trigger)
4. Test: `https://lectra-backend.onrender.com/` should now show API info
5. Test: `https://lectra-backend.onrender.com/health` should show health status
6. Test: `https://lectra-backend.onrender.com/api/auth/login` should work

### Problem: Backend not accessible

**Check:**

1. Go to Render dashboard → Your backend service
2. Check **Logs** tab for errors
3. Verify service status is "Live" (not "Building" or "Failed")
4. Check if service is sleeping (free tier sleeps after 15 min inactivity)

**Solution:**

- If sleeping, wait 30-60 seconds for first request
- Check environment variables are all set
- Verify MongoDB connection string is correct

---

## Frontend Issues

### Problem: Can't login or signup

**Step 1: Check Environment Variables in Render**

1. Go to Render → Your frontend Static Site
2. Click **Environment** tab
3. Verify these are set:
   ```
   REACT_APP_API_URL = https://lectra-backend.onrender.com
   REACT_APP_SOCKET_URL = https://lectra-backend.onrender.com
   ```
4. **Important**: No trailing slashes, include `https://`

**Step 2: Redeploy Frontend**

- Environment variables are baked into the build
- If you added/updated variables, you MUST redeploy
- Go to Render → Your frontend → **Manual Deploy** → **Deploy latest commit**

**Step 3: Check Browser Console**

1. Open your frontend URL
2. Press F12 → Console tab
3. Look for errors:
   - CORS errors → Backend CORS not configured
   - 404 errors → Wrong API URL
   - Network errors → Backend not accessible

**Step 4: Check Network Tab**

1. Press F12 → Network tab
2. Try to login/register
3. Look for failed requests
4. Check the request URL - does it match your backend URL?

**Step 5: Verify Backend CORS**

1. Go to Render → Your backend service
2. Check `FRONTEND_URL` environment variable
3. Should be: `https://your-frontend-url.onrender.com`
4. Must match your frontend URL exactly
5. Redeploy backend after updating

---

## Quick Fixes

### Fix 1: Update Backend CORS

```bash
# In Render backend environment variables:
FRONTEND_URL = https://your-actual-frontend-url.onrender.com
```

### Fix 2: Update Frontend Environment Variables

```bash
# In Render frontend environment variables:
REACT_APP_API_URL = https://lectra-backend.onrender.com
REACT_APP_SOCKET_URL = https://lectra-backend.onrender.com
```

### Fix 3: Test Backend Endpoints

Test these URLs directly in browser or Postman:

1. **Root**: `https://lectra-backend.onrender.com/`

   - Should return API info

2. **Health**: `https://lectra-backend.onrender.com/health`

   - Should return: `{"status":"healthy",...}`

3. **Register**: `POST https://lectra-backend.onrender.com/api/auth/register`

   - Body: `{"email":"test@test.com","password":"test123","firstName":"Test","lastName":"User","role":"student"}`

4. **Login**: `POST https://lectra-backend.onrender.com/api/auth/login`
   - Body: `{"email":"test@test.com","password":"test123"}`

---

## Common Errors

### Error: "Network Error" or "Failed to fetch"

**Cause**: Backend not accessible or CORS issue

**Fix**:

1. Check backend is running (visit backend URL)
2. Verify `FRONTEND_URL` in backend matches frontend URL
3. Check browser console for CORS errors

### Error: "404 Not Found" on API calls

**Cause**: Wrong API URL or route doesn't exist

**Fix**:

1. Verify `REACT_APP_API_URL` is correct
2. Check backend routes are working (test in browser)
3. Make sure URL has no trailing slash

### Error: "CORS policy" error

**Cause**: Backend CORS not allowing frontend origin

**Fix**:

1. Update `FRONTEND_URL` in backend environment variables
2. Must match frontend URL exactly (including https://)
3. Redeploy backend

### Error: Environment variables not working

**Cause**: Variables added after build or wrong naming

**Fix**:

1. Variables must start with `REACT_APP_` for React
2. Must be set BEFORE building
3. Redeploy frontend after adding/updating variables

---

## Testing Checklist

- [ ] Backend root URL works: `https://lectra-backend.onrender.com/`
- [ ] Backend health check works: `https://lectra-backend.onrender.com/health`
- [ ] Backend register endpoint works (test with Postman)
- [ ] Backend login endpoint works (test with Postman)
- [ ] Frontend environment variables are set correctly
- [ ] Frontend redeployed after setting environment variables
- [ ] Backend `FRONTEND_URL` matches frontend URL exactly
- [ ] No CORS errors in browser console
- [ ] No 404 errors in browser console
- [ ] Network requests show correct backend URL

---

## Still Not Working?

1. **Check Render Logs**:

   - Backend: Render → Backend service → Logs
   - Frontend: Render → Frontend service → Logs

2. **Check Browser Console**:

   - F12 → Console tab
   - Look for red errors

3. **Check Network Tab**:

   - F12 → Network tab
   - See what requests are failing

4. **Test Backend Directly**:

   - Use Postman or curl to test API endpoints
   - Verify backend is actually working

5. **Verify Environment Variables**:
   - Double-check all variables are set correctly
   - No typos, correct URLs, no trailing slashes
