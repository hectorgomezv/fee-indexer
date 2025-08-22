import { bootstrap } from '@container.js';
import express, { type Application } from 'express';

export async function initApp(): Promise<Application> {
  await bootstrap();
  const app = express();
  app.use(express.json());
  return app;
}
