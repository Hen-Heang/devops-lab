const express = require('express');
const app = express();
const port = Number(process.env.PORT || 3000);

app.get('/', (_req, res) => {
  res.json({ message: 'API is running!', env: process.env.NODE_ENV || 'development', version: '1.0.0' });
});
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
process.on('SIGTERM', () => server.close());
