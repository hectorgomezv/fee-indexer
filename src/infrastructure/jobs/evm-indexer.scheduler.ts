import { type EVMIndexerService } from '@application/services/evm-indexer.service.js';
import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import { logger } from '@infrastructure/logging/logger.js';

export class EVMScheduler {
  private latestBlock: number;
  private blockDelta: number;
  private intervalMs: number;

  constructor(
    private indexerService: EVMIndexerService,
    chainConfig: ChainConfig,
  ) {
    this.latestBlock = chainConfig.initialBlockNumber;
    this.blockDelta = chainConfig.blockDelta;
    this.intervalMs = chainConfig.intervalMs;
  }

  // TODO: add tests

  async start(): Promise<void> {
    await this._indexJob();
    setInterval(() => this._indexJob(), this.intervalMs);
  }

  private async _indexJob() {
    try {
      const [lastBlockNumber, lastIndexedBlockNumber] = await Promise.all([
        this.indexerService.getLastBlockNumber(),
        this.indexerService.getLastIndexedBlockNumber(),
      ]);
      const fromBlock = lastIndexedBlockNumber ?? this.latestBlock;
      const toBlock = Math.min(fromBlock + this.blockDelta, lastBlockNumber);

      await this.indexerService.indexFeeCollectionEvents(fromBlock, toBlock);
      this.latestBlock = Math.min(toBlock + 1, lastBlockNumber);
    } catch (err) {
      // TODO: retry strategy?
      logger.error({
        err,
        fromBlock: this.latestBlock,
        toBlock: this.latestBlock + this.blockDelta,
      });
    }
  }
}
