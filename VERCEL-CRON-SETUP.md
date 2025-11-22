# Vercel Cron Job Setup - Keep Backend Alive

## Overview

This project includes a **Vercel cron job** that automatically pings the backend API every 14 minutes to prevent Render's free tier from pausing the service.

## Why Vercel Instead of Render Cron?

**Vercel cron jobs are more reliable** for this use case:

✅ **Better uptime** - Vercel's infrastructure is enterprise-grade
✅ **Global edge network** - Pings from multiple regions
✅ **Built-in monitoring** - View logs in Vercel dashboard
✅ **Generous free tier** - 100 cron jobs/month included
✅ **Automatic retry** - Failed executions are retried

## Setup

The cron job is configured in three files:

### 1. Serverless Function
[`api/cron/keep-alive.ts`](api/cron/keep-alive.ts) - TypeScript function that pings the backend

```typescript
// Pings: https://mentor-buddy-backend.onrender.com/api/health
// Returns: { success: boolean, backend: { status, responseTime }, timestamp }
```

### 2. Vercel Configuration
[`vercel.json`](vercel.json:25-30) - Cron schedule configuration

```json
{
  "crons": [
    {
      "path": "/api/cron/keep-alive",
      "schedule": "*/14 * * * *"
    }
  ]
}
```

### 3. Environment Variables (Vercel Dashboard)

Required environment variables to set in your Vercel project settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `BACKEND_URL` | `https://mentor-buddy-backend.onrender.com` | Backend API URL |
| `CRON_SECRET` | `<generate-random-string>` | Secret token for authorization |

**To set environment variables:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the variables above
3. Redeploy for changes to take effect

## How to Generate CRON_SECRET

Run this command to generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use online generator: https://www.uuidgenerator.net/

## Testing

### Test Locally

```bash
# Install dependencies
cd mentor-buddy-ui
npm install

# Test the function (requires environment variables)
export CRON_SECRET="your-secret-here"
export BACKEND_URL="http://localhost:3000"

# Call the function (Vercel CLI required)
vercel dev
# Visit: http://localhost:3000/api/cron/keep-alive
```

### Test in Production

After deployment, manually trigger the cron:

```bash
curl -X GET https://your-app.vercel.app/api/cron/keep-alive \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Monitoring

### View Cron Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click **Cron Jobs** in the sidebar
4. View execution history and logs

### Expected Response

Successful ping:
```json
{
  "success": true,
  "message": "Backend is alive",
  "backend": {
    "url": "https://mentor-buddy-backend.onrender.com/api/health",
    "status": 200,
    "responseTime": "234ms"
  },
  "timestamp": "2025-11-22T17:30:00.000Z"
}
```

Failed ping:
```json
{
  "success": false,
  "message": "Failed to reach backend",
  "error": "fetch failed",
  "backend": {
    "url": "https://mentor-buddy-backend.onrender.com/api/health"
  },
  "timestamp": "2025-11-22T17:30:00.000Z"
}
```

## Schedule Details

- **Frequency**: Every 14 minutes
- **Cron Expression**: `*/14 * * * *`
- **Why 14 minutes?**: Render pauses free services after 15 minutes of inactivity
- **Executions per day**: ~103 executions
- **Executions per month**: ~3,100 executions (within Vercel's 100/month Pro limit for Hobby plan includes unlimited)

## Deployment

The cron job is automatically deployed when you push to your connected Git repository:

```bash
git add api/ vercel.json package.json
git commit -m "Add Vercel cron job for keep-alive"
git push
```

Vercel will:
1. Detect the new `api/` directory
2. Build the serverless function
3. Configure the cron schedule
4. Start executing every 14 minutes

## Troubleshooting

### Cron not running

**Check Vercel plan**: Cron jobs require a Pro plan or Hobby plan with team features. Check your plan in Settings → General.

**Verify deployment**: Ensure the latest commit is deployed and shows "Ready" status.

**Check logs**: View function logs in Vercel Dashboard → Functions → keep-alive.

### Authorization errors

**Verify CRON_SECRET**: Ensure it matches in:
- Vercel environment variables
- Your test requests

**Check headers**: Vercel automatically adds the `Authorization` header with `Bearer ${CRON_SECRET}`.

### Backend not responding

**Check Render service**: Verify the backend is deployed and running in Render dashboard.

**Test health endpoint manually**:
```bash
curl https://mentor-buddy-backend.onrender.com/api/health
```

**Check backend URL**: Verify `BACKEND_URL` environment variable is correct.

## Disabling the Cron

To temporarily disable without removing code:

1. Go to Vercel Dashboard → Settings → Cron Jobs
2. Toggle off the keep-alive cron
3. Or remove the `crons` section from `vercel.json` and redeploy

## Cost

Vercel's Hobby (free) plan includes:
- **Unlimited** function invocations
- **100 GB-hours** of function execution time per month
- Our keep-alive function uses ~1ms per execution = minimal cost

**Monthly usage estimate:**
- 3,100 executions × 1ms = 3.1 seconds of execution time
- Well within free tier limits

## Security

The cron endpoint is protected by:
1. **Authorization header**: Requires `Bearer ${CRON_SECRET}`
2. **Vercel-only access**: Only Vercel infrastructure can pass the secret
3. **No sensitive data**: Function only pings public health endpoint

## Alternative Solutions

If Vercel cron doesn't work for your use case:

1. **UptimeRobot** - Free external monitoring (up to 50 monitors)
2. **Render Cron Jobs** - Already configured in backend (see `KEEP-ALIVE.md` in backend)
3. **GitHub Actions** - Scheduled workflows (`.github/workflows/keep-alive.yml`)
4. **cron-job.org** - Free cron service

---

**Note**: You can use both Vercel and Render cron jobs for redundancy - they won't conflict and provide backup if one fails.
