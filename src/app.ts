import express, { type Application } from 'express';
import { bootstrap } from './container.js';

export function initApp(): Application {
  const app = express();
  app.use(express.json());
  bootstrap();
  return app;
}
