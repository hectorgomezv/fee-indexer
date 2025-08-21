import type { EVMClient } from '@domain/repositories/evm-client.interface.js';
import { logger } from '@infrastructure/logging/logger.js';

export class EVMIndexerService {
  constructor(private evmClient: EVMClient) {}

  async indexFeeCollectionEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<void> {
    logger.info(`Indexing from block ${fromBlock} to block ${toBlock}`);
    const res = await this.evmClient.fetchFeesCollectedEvents(
      fromBlock,
      toBlock,
    );
    logger.info(`Fetched ${res.length} FeesCollected events`);
    logger.info(res); // TODO: remove events logging
  }

  async getLastBlockNumber(): Promise<number> {
    return this.evmClient.getLastBlockNumber();
  }
}
