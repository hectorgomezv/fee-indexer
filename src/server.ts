import { db } from '@infrastructure/mongo/db.js';
import { ChainInstance } from '@chain-instance.js';
import 'dotenv/config';
import chainConfigs from './infrastructure/config/chains-config.json' with { type: 'json' };
import type { Application, Request, Response, NextFunction } from 'express';
import { HttpServer } from '@http-server.js';

// Improvement note:
// For the sake of simplicity, chains configuration is static and loaded from a JSON at startup.
// We could consider using a more flexible configuration system (like a database or environment
// variables) and validate the configuration data.
async function main() {
  db.initializeDatabase({ uri: process.env.MONGO_URI! });
  const httpServer = new HttpServer();
  const instances = chainConfigs.map(
    // httpServer.app is passed to each ChainInstance to add its routes
    (chainConfig) => new ChainInstance(chainConfig, httpServer.getApp()),
  );
  await Promise.all(instances.map((instance) => instance.start()));
  httpServer.start();
}

main();
