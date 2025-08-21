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

  async start(): Promise<void> {
    await this._indexJob();
    setInterval(() => this._indexJob(), this.intervalMs);
  }

  private async _indexJob() {
    const lastBlockNumber = await this.indexerService.getLastBlockNumber();
    const fromBlock = this.latestBlock;
    const toBlock = Math.min(
      this.latestBlock + this.blockDelta,
      lastBlockNumber,
    );
    try {
      await this.indexerService.indexFeeCollectionEvents(fromBlock, toBlock);
      this.latestBlock = Math.min(toBlock + 1, lastBlockNumber);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Unexpected throw');
      logger.error({ err, fromBlock, toBlock });
    }
  }
}
