import { EVMIndexerService } from '@application/services/evm-indexer.service.js';
import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import { EVMIndexerController } from '@infrastructure/api/fees-collected/fees-collected.controller.js';
import { EVMClient } from '@infrastructure/evm/evm-client.js';
import { EVMScheduler } from '@infrastructure/jobs/evm-indexer.scheduler.js';
import { getFeesCollectedLastBlockModel } from '@infrastructure/mongo/models/fees-collected-last-block.model.js';
import { getFeesCollectedEventModel } from '@infrastructure/mongo/models/parsed-fees-collected-event.model.js';
import { MongoEventsRepository } from '@infrastructure/mongo/mongo-events.repository.js';
import type { Application } from 'express';

const chainConfigs: ChainConfig[] = [
  {
    chainId: '137',
    chainName: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    contractAddress: '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9',
    blockDelta: 50,
    initialBlockNumber: 70_000_000,
    intervalMs: 2_000,
  },
  {
    chainId: '8453',
    chainName: 'Base',
    rpcUrl: 'https://base.drpc.org',
    contractAddress: '0x0a6d96e7f4d7b96cfe42185df61e64d255c12dff',
    blockDelta: 50,
    initialBlockNumber: 30_000_000,
    intervalMs: 500,
  },
];

export async function bootstrapIndexers(
  httpServer: Application,
): Promise<void> {
  await Promise.all(
    chainConfigs.map((chainConfig) =>
      _bootstrapChainIndexer(chainConfig, httpServer),
    ),
  );
}

async function _bootstrapChainIndexer(
  chainConfig: ChainConfig,
  httpServer: Application,
): Promise<void> {
  const { chainId, chainName } = chainConfig;
  const feesCollectedLastBlockModel = getFeesCollectedLastBlockModel(chainName);
  const feesCollectedEventModel = getFeesCollectedEventModel(chainName);
  const repository = new MongoEventsRepository(
    feesCollectedLastBlockModel,
    feesCollectedEventModel,
  );
  const client = new EVMClient(chainConfig);
  const service = new EVMIndexerService(chainConfig, client, repository);
  const scheduler = new EVMScheduler(service, chainConfig);
  const httpController = new EVMIndexerController(service);
  httpServer.use(`/api/${chainId}`, httpController.router);
  await scheduler.start();
}
