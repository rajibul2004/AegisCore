const https = require('https');
const http = require('http');

/**
 * Self-ping mechanism to prevent free-tier hosting (like Render/Heroku) from putting the server to sleep.
 */
const startKeepAlive = () => {
  // Render injects RENDER_EXTERNAL_URL automatically. 
  // Fallback to BACKEND_URL if deployed elsewhere.
  const url = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;

  if (!url) {
    return; // Silently skip if no public URL is provided (e.g. local dev)
  }

  // Determine if HTTP or HTTPS
  const protocol = url.startsWith('https') ? https : http;
  
  // Render sleeps after 15 mins of inactivity. Ping every 10 minutes.
  const interval = 10 * 60 * 1000; 

  setInterval(() => {
    protocol.get(`${url}/api/health`, (resp) => {
      // We don't log success to keep the console clean in production, 
      // but the network traffic hits the load balancer and resets the sleep timer!
      if (resp.statusCode !== 200) {
        console.error(`[Keep-Alive] Ping failed with status: ${resp.statusCode}`);
      }
    }).on('error', (err) => {
      console.error(`[Keep-Alive] Error: ${err.message}`);
    });
  }, interval);
};

module.exports = startKeepAlive;
