import { EVMIndexerService } from '@application/services/evm-indexer.service.js';
import { EVMClient } from '@infrastructure/evm/evm-client.js';
import { EVMScheduler } from '@infrastructure/jobs/evm-indexer.scheduler.js';
import { db } from '@infrastructure/mongo/db.js';
import { MongoEventsRepository } from '@infrastructure/mongo/mongo-events.repository.js';

export async function bootstrap() {
  await _bootstrapPolygon();
}

async function _bootstrapPolygon() {
  const chainConfig = {
    rpcUrl: 'https://polygon-rpc.com',
    contractAddress: '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9',
    blockDelta: 50,
    initialBlockNumber: 70_000_000,
    intervalMs: 5_000,
  };
  const dbInstance = db.getInstance({
    uri: 'mongodb://localhost:27017/fees',
  });
  const mongoEventsRepository = new MongoEventsRepository(dbInstance);
  const polygonClient = new EVMClient(chainConfig);
  const polygonIndexer = new EVMIndexerService(
    polygonClient,
    mongoEventsRepository,
  );
  const polygonScheduler = new EVMScheduler(polygonIndexer, chainConfig);
  await polygonScheduler.start();
}
