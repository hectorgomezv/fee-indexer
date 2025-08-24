import { logger } from '@infrastructure/logging/logger.js';
import express, { type Application } from 'express';

export async function initHttpServer(): Promise<Application> {
  const port = process.env.PORT ?? 3000;
  const server = express();
  server.use(express.json());
  server.listen(port, () => {
    logger.info(`[HTTP Server] Listening at http://localhost:${port}`);
  });
  return server;
}
