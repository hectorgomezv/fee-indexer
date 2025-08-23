import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';

export interface EventsRepository {
  /**
   * Stores the given FeesCollected events in the database.
   * @param events The FeesCollected events to store.
   */
  storeFeesCollectedEvents(events: ParsedFeesCollectedEvent[]): Promise<void>;

  /**
   * Sets the last block number for FeesCollected events.
   * @param blockNumber The last block number to set.
   */
  setFeesCollectedLastBlock(blockNumber: number): Promise<void>;

  /**
   * Gets the last block number for FeesCollected events.
   * @returns The last block number, or null if not found.
   */
  getFeesCollectedLastBlock(): Promise<number | null>;

  /**
   * Finds FeesCollected events by integrator.
   * @param integrator The integrator to filter events by.
   * @returns The matching FeesCollected events.
   */
  findFeesCollectedEventsByIntegrator(
    integrator: ParsedFeesCollectedEvent['integrator'],
  ): Promise<ParsedFeesCollectedEvent[]>;
}
