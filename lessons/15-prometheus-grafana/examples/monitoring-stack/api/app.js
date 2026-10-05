import express from 'express';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics
} from 'prom-client';

export function createApplication() {
  const registry = new Registry();
  collectDefaultMetrics({ register: registry });
  const requests = new Counter({
    name: 'http_requests_total',
    help: 'Completed application HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [registry]
  });
  const duration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Application HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
    registers: [registry]
  });
  const app = express();
  app.use((req, res, next) => {
    const end = duration.startTimer();
    res.once('finish', () => {
      const method = [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'HEAD',
        'OPTIONS'
      ].includes(req.method)
        ? req.method
        : 'OTHER';
      const labels = {
        method,
        route: req.route?.path || 'unmatched',
        status: String(res.statusCode)
      };
      requests.inc(labels);
      end(labels);
    });
    next();
  });
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/users/:id', (req, res) => {
    if (req.params.id !== '1') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user: { id: 1, name: 'Demo' } });
  });
  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

  // A separate listener means the public application port never serves metrics.
  const metricsApp = express();
  metricsApp.get('/metrics', async (_req, res) => {
    try {
      res.set('Content-Type', registry.contentType);
      res.end(await registry.metrics());
    } catch {
      res.status(500).end();
    }
  });
  return { app, metricsApp, registry };
}
