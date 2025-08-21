import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';

export interface EventsRepository {
  storeFeesCollectedEvent(event: ParsedFeesCollectedEvent): Promise<void>;
  findFeesCollectedEventsByIntegrator(
    integrator: ParsedFeesCollectedEvent['integrator'],
  ): Promise<ParsedFeesCollectedEvent[]>;
}
