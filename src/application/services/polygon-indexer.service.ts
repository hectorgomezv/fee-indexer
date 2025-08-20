import { logger } from '@infrastructure/logging/logger.js';

export class PolygonIndexerService {
  async index(fromBlock: number, toBlock: number): Promise<void> {
    // TODO: Implementation for indexing the fee collector events
    logger.info(`Indexing from block ${fromBlock} to block ${toBlock}`);
  }
}
