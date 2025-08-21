import { EVMIndexerService } from '@application/services/evm-indexer.service.js';
import { EVMClient } from '@infrastructure/evm/evm-client.js';
import { EVMScheduler } from '@infrastructure/jobs/evm-indexer.scheduler.js';
import { db } from '@infrastructure/mongo/db.js';
import { MongoEventsRepository } from '@infrastructure/mongo/mongo-events.repository.js';

export async function bootstrap() {
  await _bootstrapPolygon();
}

async function _bootstrapPolygon() {
  // TODO: abstract away configuration, initialize containers based on an array of ChainConfigs
  const chainConfig = {
    rpcUrl: 'https://polygon-rpc.com',
    contractAddress: '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9',
    blockDelta: 50,
    initialBlockNumber: 70_000_000,
    intervalMs: 5_000,
  };
  db.initializeDatabase({
    uri: process.env.MONGO_URI!,
  });
  const mongoEventsRepository = new MongoEventsRepository();
  const polygonClient = new EVMClient(chainConfig);
  const polygonIndexer = new EVMIndexerService(
    polygonClient,
    mongoEventsRepository,
  );
  const polygonScheduler = new EVMScheduler(polygonIndexer, chainConfig);
  await polygonScheduler.start();
}
