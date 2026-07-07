import dotenv from 'dotenv';

dotenv.config();

import app from './app';
import { closeDatabase } from './database';

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, () => {
  console.log(`URL Shortening Service running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
});
