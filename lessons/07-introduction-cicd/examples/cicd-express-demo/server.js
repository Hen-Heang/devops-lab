import { app } from './app.js';

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`CI practice API listening on port ${port}`);
});

process.on('SIGTERM', () => {
  server.close();
});
