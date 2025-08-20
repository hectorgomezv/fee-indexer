import { PolygonIndexerService } from '@application/services/polygon-indexer.service.js';
import { logger } from '@infrastructure/logging/logger.js';

export class PolygonScheduler {
  private static BLOCK_DELTA = 50;
  private static INITIAL_BLOCK_NUMBER = 70_000_000;
  private static INTERVAL_MS = 10_000;
  private latestBlock: number = PolygonScheduler.INITIAL_BLOCK_NUMBER; // TODO: implement checkpoints.

  constructor(private polygonIndexerService: PolygonIndexerService) {}

  async start() {
    await this._indexJob();
    setInterval(() => this._indexJob(), PolygonScheduler.INTERVAL_MS);
  }

  private async _indexJob() {
    const lastBlockNumber =
      await this.polygonIndexerService.getLastBlockNumber();
    const fromBlock = this.latestBlock;
    const toBlock = Math.min(
      this.latestBlock + PolygonScheduler.BLOCK_DELTA,
      lastBlockNumber,
    );
    try {
      await this.polygonIndexerService.indexFeeCollectionEvents(
        fromBlock,
        toBlock,
      );
      this.latestBlock = toBlock + 1;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Unexpected throw');
      logger.error({ err, fromBlock, toBlock });
    }
  }
}
