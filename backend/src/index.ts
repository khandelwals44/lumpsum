import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { logEnvSummary, logConfig, logSafe } from './lib/logSafe.js';
import { isDevelopment } from './lib/env.server.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log environment and config on startup (development only)
if (isDevelopment()) {
  logEnvSummary();
  logConfig();
  logSafe('Backend server starting...', { port: PORT });
}

// Health check endpoint
app.get('/health', (req, res) => {
  logSafe('Health check request', { 
    method: req.method, 
    url: req.url, 
    userAgent: req.get('User-Agent') 
  });
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  logSafe(`Server running on port ${PORT}`);
});

export default app;
