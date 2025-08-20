import type { PolygonIndexerService } from '@application/services/polygon-indexer.service.js';
import { logger } from '@infrastructure/logging/logger.js';

export class PolygonScheduler {
  constructor(private polygonIndexerService: PolygonIndexerService) {}

  start() {
    const BLOCK_DELTA = 10;
    const INTERVAL_MS = 5_000;

    setInterval(async () => {
      const latestBlock = 70000000 + BLOCK_DELTA; // TODO: implement checkpoints.
      const fromBlock = latestBlock - BLOCK_DELTA;
      const toBlock = latestBlock;
      try {
        await this.polygonIndexerService.index(fromBlock, toBlock);
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error('Unexpected throw');
        logger.error({ err, fromBlock, toBlock });
      }
    }, INTERVAL_MS);
  }
}
