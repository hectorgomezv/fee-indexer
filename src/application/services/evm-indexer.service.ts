import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';
import type { EventsRepository } from '@domain/repositories/events.repository.interface.js';
import type { EVMClient } from '@domain/repositories/evm-client.interface.js';
import { logger } from '@infrastructure/logging/logger.js';

export class EVMIndexerService {
  constructor(
    private chainConfig: ChainConfig,
    private evmClient: EVMClient,
    private eventsRepository: EventsRepository,
  ) {}

  async indexFeeCollectionEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<void> {
    const { chainName } = this.chainConfig;
    logger.info(`[${chainName}] Indexing block range ${fromBlock}-${toBlock}`);
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

  // Improvement note:
  // Consider adding caching for fees collected events by integrator.
  // Options:
  // a. Invalidating the integrator's cache entry entirely when new events are indexed.
  // b. Maintaining a Redis sorted set of events synchronized with the DB.
  /**
   * Get fees collected by a specific integrator.
   * @param integrator The integrator's identifier.
   * @returns The fees collected by the integrator.
   */
  async getFeesCollectedByIntegrator(
    integrator: string,
  ): Promise<ParsedFeesCollectedEvent[]> {
    const events =
      await this.eventsRepository.findFeesCollectedEventsByIntegrator(
        integrator,
      );
    logger.info(
      `[${this.chainConfig.chainName}] Found ${events.length} events for integrator ${integrator}`,
    );
    return events;
  }

  /**
   * Get the last block number in the blockchain.
   * @returns The last block number.
   */
  async getLastBlockInChain(): Promise<number> {
    return this.evmClient.getLastBlockInChain();
  }

  /**
   * Get the last indexed block number.
   * @returns The last indexed block number or null if not found.
   */
  async getLastIndexedBlockNumber(): Promise<number | null> {
    return this.eventsRepository.getFeesCollectedLastBlock();
  }
}
