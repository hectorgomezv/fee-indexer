import { initApp } from '@app.js';
import { logger } from '@infrastructure/logging/logger.js';
import 'dotenv/config';

const app = initApp();
const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
