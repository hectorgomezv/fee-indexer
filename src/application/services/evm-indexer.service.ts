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
    return this.eventsRepository.storeFeesCollectedEvents(events);
  }

  async getLastBlockNumber(): Promise<number> {
    return this.evmClient.getLastBlockNumber();
  }
}
