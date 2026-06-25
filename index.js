import dotenv from 'dotenv';
import { createApp, initServer } from './configs/app.js';

dotenv.config();

let appPromise;

export default async function handler(req, res) {
  if (!appPromise) {
    appPromise = createApp();
  }

  const app = await appPromise;
  return app(req, res);
}

if (!process.env.VERCEL) {
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', err);
    process.exit(1);
  });

  initServer();
}
