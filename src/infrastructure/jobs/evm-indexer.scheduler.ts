import { type EVMIndexerService } from '@application/services/evm-indexer.service.js';
import type { ChainConfig } from '@domain/entities/chain-config.entity.js';

export class EVMScheduler {
  private latestBlock: number;

  constructor(
    private indexerService: EVMIndexerService,
    private chainConfig: ChainConfig,
  ) {
    this.latestBlock = chainConfig.initialBlockNumber - 1;
  }

  async start(): Promise<void> {
    await this._indexJob();
    setInterval(() => this._indexJob(), this.chainConfig.intervalMs);
  }

  private async _indexJob() {
    const lastBlock = await this.indexerService.getLastBlockNumber();
    const lastIndexed = await this.indexerService.getLastIndexedBlockNumber();
    const fromBlock = (lastIndexed ?? this.latestBlock) + 1;
    const toBlock = Math.min(
      fromBlock + this.chainConfig.blockDelta - 1,
      lastBlock,
    );
    await this.indexerService.indexFeeCollectionEvents(fromBlock, toBlock);
    this.latestBlock = Math.min(toBlock + 1, lastBlock);
  }
}
