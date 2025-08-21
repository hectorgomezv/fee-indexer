import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';

export interface EventsRepository {
  storeFeesCollectedEvents(events: ParsedFeesCollectedEvent[]): Promise<void>;
  findFeesCollectedEventsByIntegrator(
    integrator: ParsedFeesCollectedEvent['integrator'],
  ): Promise<ParsedFeesCollectedEvent[]>;
}
