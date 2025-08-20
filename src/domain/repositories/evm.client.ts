import type { ParsedFeeCollectorEvent } from '@domain/entities/parsed-fee-collector-event.entity.js';

type BlockTag = string | number;

export interface EVMClient {
  fetchFeeCollectorEvents(
    fromBlock: BlockTag,
    toBlock: BlockTag,
  ): Promise<ParsedFeeCollectorEvent[]>;
}
