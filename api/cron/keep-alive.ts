import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Cron Job - Keep Backend Alive
 *
 * This serverless function runs every 14 minutes to ping the backend API
 * and prevent Render's free tier from pausing the service due to inactivity.
 *
 * Schedule: Every 14 minutes (configured in vercel.json)
 * Backend URL: https://mentor-buddy-backend.onrender.com
 */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Verify this is a cron job request from Vercel
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const backendUrl = process.env.BACKEND_URL || 'https://mentor-buddy-backend.onrender.com';
  const healthEndpoint = `${backendUrl}/api/health`;

  try {
    console.log(`[Keep-Alive] Pinging backend at ${healthEndpoint}...`);

    const startTime = Date.now();
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Cron-Keep-Alive/1.0',
      },
    });

    const responseTime = Date.now() - startTime;
    const status = response.status;
    const isHealthy = status >= 200 && status < 300;

    console.log(`[Keep-Alive] Backend responded: ${status} in ${responseTime}ms`);

    if (isHealthy) {
      return res.status(200).json({
        success: true,
        message: 'Backend is alive',
        backend: {
          url: healthEndpoint,
          status,
          responseTime: `${responseTime}ms`,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error(`[Keep-Alive] Backend unhealthy: ${status}`);
      return res.status(200).json({
        success: false,
        message: 'Backend responded but may be unhealthy',
        backend: {
          url: healthEndpoint,
          status,
          responseTime: `${responseTime}ms`,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('[Keep-Alive] Error pinging backend:', error);

    return res.status(200).json({
      success: false,
      message: 'Failed to reach backend',
      error: error instanceof Error ? error.message : 'Unknown error',
      backend: {
        url: healthEndpoint,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
