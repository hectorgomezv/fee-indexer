import type { PolygonIndexerService } from '@application/services/polygon-indexer.service.js';

export class PolygonScheduler {
  constructor(private polygonIndexerService: PolygonIndexerService) {}

  start() {
    const BLOCK_DELTA = 10;
    const INTERVAL_MS = 5_000;

    setInterval(async () => {
      try {
        const latestBlock = 70000000 + BLOCK_DELTA; // TODO: implement checkpoints.
        const fromBlock = latestBlock - BLOCK_DELTA;
        const toBlock = latestBlock;
        await this.polygonIndexerService.index(fromBlock, toBlock);
      } catch (error) {
        console.error('Error fetching fee collector events:', error); // TODO: proper error handling.
      }
    }, INTERVAL_MS);
  }
}
