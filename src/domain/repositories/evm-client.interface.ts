import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';

type BlockTag = string | number;

export interface EVMClient {
  /**
   * Fetches the FeesCollected events within the specified block range.
   * @param fromBlock The starting block number (inclusive).
   * @param toBlock The ending block number (inclusive).
   */
  fetchFeesCollectedEvents(
    fromBlock: BlockTag,
    toBlock: BlockTag,
  ): Promise<ParsedFeesCollectedEvent[]>;

  /**
   * Gets the last block in the chain.
   */
  getLastBlockInChain(): Promise<number>;
}
