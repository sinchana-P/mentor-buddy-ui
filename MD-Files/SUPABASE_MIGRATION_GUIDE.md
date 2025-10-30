# Supabase Migration Guide - API Fix

## Issue
After migrating from the old Supabase project (paused/expired) to the new Supabase project, all APIs were failing due to incorrect database connection credentials.

## Solution Applied

### 1. Local Development Environment (FIXED ✅)

Updated `/mentor-buddy-backend/.env` with new Supabase credentials:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:SinchanaPGudagi@db.bgbkqswuuvyuhtrosdkd.supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://bgbkqswuuvyuhtrosdkd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnYmtxc3d1dXZ5dWh0cm9zZGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjQyODcsImV4cCI6MjA3NzA0MDI4N30.W1zJX4WLFCJtS4LVZji1mrT7oWT5rQkqNTDvidtUUEk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnYmtxc3d1dXZ5dWh0cm9zZGtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ2NDI4NywiZXhwIjoyMDc3MDQwMjg3fQ.C5hE50_l5vcsT8wu9hK71YtRW43M6uULMnT5Lg5v6xc
```

**Status**: ✅ Working
- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:5175`
- Database connection verified with 58 users and 17 mentors

---

## 2. Production Environment (Render) - ACTION REQUIRED ⚠️

You need to update the environment variables in your **Render dashboard** for production deployment.

### Steps to Update Render:

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your backend service** (mentor-buddy-backend or similar name)
3. **Navigate to**: Environment → Environment Variables
4. **Update the following variables**:

```
DATABASE_URL=postgresql://postgres:SinchanaPGudagi@db.bgbkqswuuvyuhtrosdkd.supabase.co:5432/postgres

SUPABASE_URL=https://bgbkqswuuvyuhtrosdkd.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnYmtxc3d1dXZ5dWh0cm9zZGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjQyODcsImV4cCI6MjA3NzA0MDI4N30.W1zJX4WLFCJtS4LVZji1mrT7oWT5rQkqNTDvidtUUEk

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnYmtxc3d1dXZ5dWh0cm9zZGtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ2NDI4NywiZXhwIjoyMDc3MDQwMjg3fQ.C5hE50_l5vcsT8wu9hK71YtRW43M6uULMnT5Lg5v6xc
```

5. **Keep these existing variables** (don't change):
```
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://mentor-buddy.vercel.app,https://mentor-buddy-panel.vercel.app
JWT_SECRET=mentor-buddy-jwt-secret-key-change-in-production-2024
JWT_EXPIRES_IN=7d
```

6. **Save changes** - Render will automatically redeploy your backend

---

## 3. Verification Steps

### Local Verification ✅
- [x] Backend server starts without errors
- [x] Database connection successful
- [x] Health endpoint working: `http://localhost:3000/api/health`
- [x] Debug endpoint returns data: `http://localhost:3000/api/debug/db`
- [x] Login endpoint responding: `http://localhost:3000/api/auth/login`
- [x] Frontend starts and connects to backend

### Production Verification (After Render Update)
- [ ] Visit your production backend health endpoint
- [ ] Test login on production frontend
- [ ] Verify all API calls work in production
- [ ] Check Render logs for any errors

---

## Old vs New Configuration

### Old Supabase Project (EXPIRED)
```
Project Ref: fbxmsxjbrffgejwgskeg
Region: aws-0-ap-southeast-1
URL: https://fbxmsxjbrffgejwgskeg.supabase.co
```

### New Supabase Project (ACTIVE)
```
Project Ref: bgbkqswuuvyuhtrosdkd
Region: ap-northeast-1
URL: https://bgbkqswuuvyuhtrosdkd.supabase.co
```

---

## Key Changes Made

1. **Updated DATABASE_URL** with new project reference and region
2. **Updated SUPABASE_URL** to new project URL
3. **Updated SUPABASE_ANON_KEY** with new project key
4. **Updated SUPABASE_SERVICE_ROLE_KEY** with new project key
5. **Updated drizzle.config.ts** to handle SSL properly
6. **Restarted backend server** to apply new configuration

---

## Troubleshooting

### If APIs still fail after updating Render:

1. **Check Render Logs**:
   - Go to your Render service → Logs
   - Look for database connection errors
   - Verify the connection string is correct

2. **Verify Supabase Project Status**:
   - Ensure the new project is not paused
   - Check that the project is in "Active" status

3. **Test Database Connection**:
   ```bash
   curl https://your-render-url.onrender.com/api/health
   curl https://your-render-url.onrender.com/api/debug/db
   ```

4. **Check CORS Settings**:
   - Ensure CORS_ORIGIN includes your Vercel frontend URLs

---

## Migration Summary

✅ **Completed**:
- Local environment updated with new Supabase credentials
- Database connection verified
- Backend and frontend running successfully locally
- 58 users and 17 mentors data confirmed migrated

⚠️ **Pending**:
- Update Render environment variables (production)
- Test production deployment after Render update

---

## Next Steps

1. Update Render environment variables as described above
2. Wait for automatic redeployment (~2-3 minutes)
3. Test production APIs
4. Monitor Render logs for any issues
5. If everything works, delete old Supabase project data (optional)

---

**Date**: 2025-10-26
**Status**: Local development fixed, production update pending
