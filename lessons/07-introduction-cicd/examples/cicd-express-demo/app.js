import express from 'express';

export const app = express();
const users = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Lin' }
];

app.get('/', (_req, res) => {
  res.json({ message: 'CI practice API' });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/users', (_req, res) => {
  res.json({ users });
});

app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }
  const user = users.find((entry) => entry.id === id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
