import type { ParsedFeeCollectorEvent } from 'domain/entities/parsed-fee-collector-event.entity.js';
import type { EventsRepository } from 'domain/repositories/events.repository.js';

export class MongoEventsRepository implements EventsRepository {
  async storeFeeCollectorEvent(event: ParsedFeeCollectorEvent): Promise<void> {
    // TODO: Implementation for storing the event in MongoDB
  }

  async findFeeCollectorEventByIntegrator(
    integrator: ParsedFeeCollectorEvent['integrator'],
  ): Promise<ParsedFeeCollectorEvent[]> {
    // TODO: Implementation for finding events by integrator in MongoDB
    return [];
  }
}
