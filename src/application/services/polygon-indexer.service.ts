import type { EVMClient } from '@domain/repositories/evm.client.js';
import { logger } from '@infrastructure/logging/logger.js';

export class PolygonIndexerService {
  constructor(private polygonClient: EVMClient) {}

  async indexFeeCollectionEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<void> {
    logger.info(`Indexing from block ${fromBlock} to block ${toBlock}`);
    const res = await this.polygonClient.fetchFeeCollectorEvents(
      fromBlock,
      toBlock,
    );
    logger.info(`Fetched ${res.length} FeesCollected events`);
    logger.info(res); // TODO: remove events logging
  }
}
