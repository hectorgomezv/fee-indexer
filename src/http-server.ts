import { logger } from '@infrastructure/logging/logger.js';
import { pinoHttp } from 'pino-http';
import express, { type Application } from 'express';

export async function initHttpServer(): Promise<Application> {
  const port = process.env.PORT ?? 3000;
  const server = express();
  server.use(express.json());
  server.use(pinoHttp());
  server.listen(port, () => {
    logger.info(`[HTTP Server] Listening at http://localhost:${port}`);
  });
  return server;
}
