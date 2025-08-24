import { initHttpServer } from '@http-server.js';
import { db } from '@infrastructure/mongo/db.js';
import { ChainInstance } from '@chain-instance.js';
import 'dotenv/config';
import chainConfigs from './infrastructure/config/chains-config.json' with { type: 'json' };

// Improvement note:
// For the sake of simplicity, chains configuration is static and loaded from a JSON at startup.
// We could consider using a more flexible configuration system (like a database or environment
// variables) and validate the configuration data.
class Server {
  private instances: ChainInstance[] = [];

  async initialize() {
    db.initializeDatabase({ uri: process.env.MONGO_URI! });
    const httpServer = await initHttpServer();
    this.instances = chainConfigs.map(
      (chainConfig) => new ChainInstance(chainConfig, httpServer),
    );
  }

  async start() {
    await Promise.all(this.instances.map((instance) => instance.start()));
  }

  async run() {
    await this.initialize();
    await this.start();
  }
}

(async () => {
  const server = new Server();
  await server.run();
})();
