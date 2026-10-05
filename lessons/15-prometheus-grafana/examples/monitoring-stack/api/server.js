import { createApplication } from './app.js';
const { app, metricsApp } = createApplication();
const server = app.listen(Number(process.env.PORT || 3000), '0.0.0.0');
const metricsServer = metricsApp.listen(
  Number(process.env.METRICS_PORT || 9464),
  '0.0.0.0'
);
process.on('SIGTERM', () => {
  server.close();
  metricsServer.close();
});
