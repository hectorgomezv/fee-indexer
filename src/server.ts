import { ChainInstance } from '@chain-instance.js';
import { HttpServer } from '@http-server.js';
import { Database } from '@infrastructure/mongo/db.js';
import 'dotenv/config';

// For the sake of simplicity, chains configuration is static and loaded from a JSON at startup.
import chainConfigs from './infrastructure/config/chains-config.json' with { type: 'json' };

async function main() {
  await Database.initializeDatabase({ uri: process.env.MONGO_URI! });
  const httpServer = new HttpServer();
  const instances = chainConfigs.map(
    // httpServer.app is passed to each ChainInstance to add its routes
    (chainConfig) => new ChainInstance(chainConfig, httpServer.getApp()),
  );
  await Promise.all(instances.map((instance) => instance.start()));
  httpServer.start();
}

main();
