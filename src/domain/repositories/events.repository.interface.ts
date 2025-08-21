import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';

// TODO: add TSDocs

export interface EventsRepository {
  storeFeesCollectedEvents(events: ParsedFeesCollectedEvent[]): Promise<void>;

  setFeesCollectedLastBlock(blockNumber: number): Promise<void>;

  getFeesCollectedLastBlock(): Promise<number | null>;

  findFeesCollectedEventsByIntegrator(
    integrator: ParsedFeesCollectedEvent['integrator'],
  ): Promise<ParsedFeesCollectedEvent[]>;
}
