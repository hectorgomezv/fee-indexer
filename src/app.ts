import { bootstrap } from '@container.js';
import express, { type Application } from 'express';

export function initApp(): Application {
  const app = express();
  app.use(express.json());
  bootstrap();
  return app;
}
