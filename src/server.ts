import { initApp } from '@app.js';
import { bootstrapIndexers } from '@container.js';
import { logger } from '@infrastructure/logging/logger.js';
import { db } from '@infrastructure/mongo/db.js';
import 'dotenv/config';

const app = await initApp();
const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  logger.info(`[HTTP Server] Listening at http://localhost:${port}`);
});

(async () => {
  db.initializeDatabase({ uri: process.env.MONGO_URI! });
  await bootstrapIndexers();
})();
