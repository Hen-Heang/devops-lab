const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');

const app = express();
const pool = new Pool({ connectionTimeoutMillis: 3000, query_timeout: 3000 });
const redis = new Redis(process.env.REDIS_URL || 'redis://cache:6379', {
  connectTimeout: 3000,
  commandTimeout: 3000,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  retryStrategy: (attempt) => Math.min(attempt * 200, 2000)
});
// Log a useful category without exposing connection strings or credentials.
pool.on('error', () => console.error('Database connection error'));
redis.on('error', () => console.error('Cache connection error'));

app.get('/live', (_req, res) => res.json({ status: 'alive' }));
app.get('/health', async (_req, res) => {
  try {
    await Promise.all([pool.query('SELECT 1'), redis.ping()]);
    res.json({ status: 'healthy' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});
app.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS db_time');
    res.json({ message: 'Compose API is running', dbTime: result.rows[0].db_time });
  } catch {
    res.status(503).json({ error: 'Database unavailable' });
  }
});
app.get('/cache', async (_req, res) => {
  try {
    res.json({ visits: await redis.incr('visits') });
  } catch {
    res.status(503).json({ error: 'Cache unavailable' });
  }
});

const server = app.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => {
  console.log('Compose API is listening');
});

process.on('SIGTERM', () => {
  const timeout = setTimeout(() => process.exit(1), 5000);
  timeout.unref();
  server.close(async () => {
    redis.disconnect();
    try {
      await pool.end();
      clearTimeout(timeout);
    } catch {
      process.exitCode = 1;
    }
  });
});
