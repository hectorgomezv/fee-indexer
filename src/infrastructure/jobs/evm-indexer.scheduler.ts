import { type EVMIndexerService } from '@application/services/evm-indexer.service.js';
import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import { ClientError } from '@infrastructure/evm/errors/client.error.js';
import { logger } from '@infrastructure/logging/logger.js';

type BlockRange = { startBlock: number; endBlock: number };

export class EVMScheduler {
  private nextBlock: number;

  constructor(
    private indexerService: EVMIndexerService,
    private chainConfig: ChainConfig,
  ) {
    this.nextBlock = chainConfig.initialBlockNumber;
  }

  /**
   * Starts the indexing job.
   */
  async start(): Promise<void> {
    await this.indexJob();
    setInterval(() => this.indexJob(), this.chainConfig.intervalMs);
    // Improvement note:
    // In a multi-instance deployment, race conditions could occur (multiple instances
    // might index the same block range). Using a centralized task queue or distributed
    // lock would prevent duplicate work and data.
  }

  /**
   * Indexes the fee collection events for the current block range.
   * Returns the next block number to be processed.
   * Note: This method is public for testing purposes.
   */
  public async indexJob(): Promise<number> {
    try {
      const latestBlockInChain =
        await this.indexerService.getLastBlockInChain();
      const { startBlock, endBlock } =
        await this._getBlockRange(latestBlockInChain);
      await this.indexerService.indexFeeCollectionEvents(startBlock, endBlock);
      this.nextBlock = Math.min(endBlock + 1, latestBlockInChain);
      return this.nextBlock;
    } catch (err) {
      if (err instanceof ClientError) {
        logger.error(
          `[${this.chainConfig.chainName}] An error occurred while fetching FeesCollected events: ${err.message}`,
        );
        return this.nextBlock;
        // Improvement note:
        // Interval could be adjusted dynamically (exp. backoff, etc.) on errors.
      }
      throw err;
    }
  }

  /**
   * Computes the next block range to index.
   *
   * The range starts at:
   * - the {@link ChainConfig.initialBlockNumber}, if no blocks have been indexed yet, or
   *   if the {@link ChainConfig.initialBlockNumber} is greater than the last indexed block.
   * - otherwise, the block immediately after the last indexed block.
   *
   * The range ends at `startBlock + {@link ChainConfig.blockDelta}`, unless that would exceed the
   * {@link latestBlockInChain}, in which case it is capped at {@link latestBlockInChain}.
   *
   * @param latestBlockInChain The latest block number currently available in the chain.
   * @returns An inclusive {@link BlockRange} to be indexed.
   */
  private async _getBlockRange(
    latestBlockInChain: number,
  ): Promise<BlockRange> {
    const lastIndexed = await this.indexerService.getLastIndexedBlockNumber();
    const startBlock =
      lastIndexed && lastIndexed >= this.chainConfig.initialBlockNumber
        ? lastIndexed + 1
        : this.nextBlock;
    const endBlock = Math.min(
      startBlock + this.chainConfig.blockDelta - 1,
      latestBlockInChain,
    );
    return { startBlock, endBlock };
  }
}
