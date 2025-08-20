import { PolygonIndexerService } from '@application/services/polygon-indexer.service.js';
import { logger } from '@infrastructure/logging/logger.js';

export class PolygonScheduler {
  private static BLOCK_DELTA = 50;
  private static INTERVAL_MS = 2_000;
  private latestBlock: number = 70000000; // TODO: implement checkpoints.

  constructor(private polygonIndexerService: PolygonIndexerService) {}

  async start() {
    await this._indexJob();
    setInterval(() => this._indexJob(), PolygonScheduler.INTERVAL_MS);
  }

  private async _indexJob() {
    const latestBlock = this.latestBlock + PolygonScheduler.BLOCK_DELTA; // TODO: implement checkpoints.
    const fromBlock = latestBlock - PolygonScheduler.BLOCK_DELTA;
    const toBlock = latestBlock;
    try {
      await this.polygonIndexerService.indexFeeCollectionEvents(
        fromBlock,
        toBlock,
      );
      this.latestBlock = latestBlock;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Unexpected throw');
      logger.error({ err, fromBlock, toBlock });
    }
  }
}
