import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import catalogRoutes from './routes/catalog.js';
import userDataRoutes from './routes/user-data.js';
import { pool } from './db.js';

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim());

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed.'));
  }
}));
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    response.json({ status: 'ok', database: 'connected' });
  } catch {
    response.status(503).json({ status: 'error', database: 'unavailable', message: 'The travel database is unavailable.' });
  }
});

app.use('/api', catalogRoutes);
app.use('/api', userDataRoutes);
app.use('/api', (_request, response) => response.status(404).json({ error: 'API route not found.' }));

app.use((error, _request, response, _next) => {
  if (response.headersSent) return;
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'Request body must contain valid JSON.' });
  }
  if (error.message === 'Origin is not allowed.') {
    return response.status(403).json({ error: 'Request origin is not allowed.' });
  }
  console.error('API request failed:', error.message);
  return response.status(error.status || 500).json({ error: error.status ? error.message : 'Something went wrong. Please try again.' });
});

export default app;
