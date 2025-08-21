import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';
import type { EventsRepository } from '@domain/repositories/events.repository.interface.js';

export class MongoEventsRepository implements EventsRepository {
  async storeFeesCollectedEvent(
    event: ParsedFeesCollectedEvent,
  ): Promise<void> {
    // TODO: Implementation for storing the event in MongoDB
  }

  async findFeesCollectedEventsByIntegrator(
    integrator: ParsedFeesCollectedEvent['integrator'],
  ): Promise<ParsedFeesCollectedEvent[]> {
    // TODO: Implementation for finding events by integrator in MongoDB
    return [];
  }
}
