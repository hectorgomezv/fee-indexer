import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';
import type { EventsRepository } from '@domain/repositories/events.repository.interface.js';
import { logger } from '@infrastructure/logging/logger.js';
import type { db } from '@infrastructure/mongo/db.js';
import { ParsedFeesCollectedEventModel } from '@infrastructure/mongo/models/parsed-fees-collected-event.model.js';

export class MongoEventsRepository implements EventsRepository {
  constructor(private dbInstance: db) {}

  async storeFeesCollectedEvents(
    events: ParsedFeesCollectedEvent[],
  ): Promise<void> {
    logger.info(`Storing ${events.length} feesCollected events`);
    await ParsedFeesCollectedEventModel.insertMany(events);
    logger.info(`Stored feesCollected events: ${JSON.stringify(events)}`);
  }

  async findFeesCollectedEventsByIntegrator(
    integrator: ParsedFeesCollectedEvent['integrator'],
  ): Promise<ParsedFeesCollectedEvent[]> {
    logger.info(`Finding feesCollected events for integrator: ${integrator}`);
    // TODO: Implementation for finding events by integrator in MongoDB
    return [];
  }
}
