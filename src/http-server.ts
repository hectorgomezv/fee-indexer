import { logger } from '@infrastructure/logging/logger.js';
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { pinoHttp } from 'pino-http';

export class HttpServer {
  private app: Application;
  private port: number;

  constructor() {
    this.port = Number(process.env.PORT) || 3000;
    this.app = express();
    this.app.use(express.json());
    this.app.use(pinoHttp());
  }

  start() {
    this.app.use(this._errorHandler);
    this.app.listen(this.port, () => {
      logger.info(`[HTTP Server] Listening at http://localhost:${this.port}`);
    });
  }

  getApp(): Application {
    return this.app;
  }

  private _errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    logger.error(`[Error Handler]: ${err}`);
    res.status(err?.status || 500).json({
      code: err?.code || 'UNKNOWN_ERROR',
      message: err?.message || 'Internal Server Error',
    });
  }
}
