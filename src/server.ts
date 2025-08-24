import { bootstrapIndexers } from '@container.js';
import { initHttpServer } from '@http-server.js';
import { db } from '@infrastructure/mongo/db.js';
import 'dotenv/config';

(async () => {
  db.initializeDatabase({ uri: process.env.MONGO_URI! });
  const httpServer = await initHttpServer();
  await bootstrapIndexers(httpServer);
})();
