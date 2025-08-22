import type { EventsRepository } from '@domain/repositories/events.repository.interface.js';
import type { EVMClient } from '@domain/repositories/evm-client.interface.js';
import { logger } from '@infrastructure/logging/logger.js';

export class EVMIndexerService {
  constructor(
    private evmClient: EVMClient,
    private eventsRepository: EventsRepository,
  ) {}

  async indexFeeCollectionEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<void> {
    logger.info(`Indexing from block ${fromBlock} to block ${toBlock}`);
    const events = await this.evmClient.fetchFeesCollectedEvents(
      fromBlock,
      toBlock,
    );
    // Improvement note: the following operations should ideally be wrapped in a transaction.
    // To enable transactions, MongoDB instance should be running as a replica set.
    // Another way to ensure data consistency would be storing an unique [blockHash+logIndex] for every
    // event and doing an upsert operation, but the performance trade-off should be considered.
    await this.eventsRepository.storeFeesCollectedEvents(events);
    await this.eventsRepository.setFeesCollectedLastBlock(toBlock);
  }

  async getLastBlockNumber(): Promise<number> {
    return this.evmClient.getLastBlockNumber();
  }

  async getLastIndexedBlockNumber(): Promise<number | null> {
    return this.eventsRepository.getFeesCollectedLastBlock();
  }
}
