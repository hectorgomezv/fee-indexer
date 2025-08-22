import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import type { EventsRepository } from '@domain/repositories/events.repository.interface.js';
import type { EVMClient } from '@domain/repositories/evm-client.interface.js';
import { logger } from '@infrastructure/logging/logger.js';

export class EVMIndexerService {
  constructor(
    private chainConfig: ChainConfig,
    private evmClient: EVMClient,
    private eventsRepository: EventsRepository,
  ) {}

  // TODO: add tests

  async indexFeeCollectionEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<void> {
    const { chainName } = this.chainConfig;
    logger.info(
      `[${chainName}] Indexing block ${fromBlock} to block ${toBlock}`,
    );
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
    logger.info(`[${chainName}] ${events.length} event(s) indexed`);
  }

  async getLastBlockNumber(): Promise<number> {
    return this.evmClient.getLastBlockNumber();
  }

  async getLastIndexedBlockNumber(): Promise<number | null> {
    return this.eventsRepository.getFeesCollectedLastBlock();
  }
}
