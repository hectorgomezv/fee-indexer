import { EVMIndexerService } from '@application/services/evm-indexer.service.js';
import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import { EVMClient } from '@infrastructure/evm/evm-client.js';
import { EVMScheduler } from '@infrastructure/jobs/evm-indexer.scheduler.js';
import { db } from '@infrastructure/mongo/db.js';
import { getFeesCollectedLastBlockModel } from '@infrastructure/mongo/models/fees-collected-last-block.model.js';
import { getFeesCollectedEventModel } from '@infrastructure/mongo/models/parsed-fees-collected-event.model.js';
import { MongoEventsRepository } from '@infrastructure/mongo/mongo-events.repository.js';

const chainConfigs: ChainConfig[] = [
  {
    chainId: '137',
    chainName: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    contractAddress: '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9',
    blockDelta: 50,
    initialBlockNumber: 70_000_000,
    intervalMs: 5_000,
  },
  {
    chainId: '8453',
    chainName: 'Base',
    rpcUrl: 'https://base.drpc.org',
    contractAddress: '0x0a6d96e7f4d7b96cfe42185df61e64d255c12dff',
    blockDelta: 50,
    initialBlockNumber: 30_000_000,
    intervalMs: 5_000,
  },
];

export async function bootstrap(): Promise<void> {
  db.initializeDatabase({ uri: process.env.MONGO_URI! });
  await Promise.all(chainConfigs.map((config) => _bootstrapChain(config)));
}

async function _bootstrapChain(chainConfig: ChainConfig): Promise<void> {
  const { chainName } = chainConfig;
  const feesCollectedLastBlockModel = getFeesCollectedLastBlockModel(chainName);
  const feesCollectedEventModel = getFeesCollectedEventModel(chainName);
  const mongoEventsRepository = new MongoEventsRepository(
    feesCollectedLastBlockModel,
    feesCollectedEventModel,
  );
  const evmClient = new EVMClient(chainConfig);
  const evmIndexer = new EVMIndexerService(
    chainConfig,
    evmClient,
    mongoEventsRepository,
  );
  const evmScheduler = new EVMScheduler(evmIndexer, chainConfig);
  await evmScheduler.start();
}
