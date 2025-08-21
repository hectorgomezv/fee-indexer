import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';

type BlockTag = string | number;

export interface EVMClient {
  fetchFeesCollectedEvents(
    fromBlock: BlockTag,
    toBlock: BlockTag,
  ): Promise<ParsedFeesCollectedEvent[]>;

  getLastBlockNumber(): Promise<number>;
}
