import express, { type Application } from 'express';

export async function initApp(): Promise<Application> {
  const app = express();
  app.use(express.json());
  return app;
}
