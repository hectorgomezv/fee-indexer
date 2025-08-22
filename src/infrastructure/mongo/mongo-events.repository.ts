import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';
import type { EventsRepository } from '@domain/repositories/events.repository.interface.js';
import { logger } from '@infrastructure/logging/logger.js';
import { ParsedFeesCollectedEventMapper } from '@infrastructure/mongo/mappers/parsed-fees-collected-event.mapper.js';
import { FeesCollectedLastBlockModel } from '@infrastructure/mongo/models/fees-collected-last-block.model.js';
import { ParsedFeesCollectedEventModel } from '@infrastructure/mongo/models/parsed-fees-collected-event.model.js';

export class MongoEventsRepository implements EventsRepository {
  async storeFeesCollectedEvents(
    events: ParsedFeesCollectedEvent[],
  ): Promise<void> {
    logger.debug(`Storing ${events.length} feesCollected events`);
    await ParsedFeesCollectedEventModel.insertMany(
      events.map((e) => ParsedFeesCollectedEventMapper.toPersistence(e)),
    );
    logger.info(`Stored ${events.length} feesCollected events`);
  }

  async setFeesCollectedLastBlock(blockNumber: number): Promise<void> {
    await FeesCollectedLastBlockModel.updateOne(
      {},
      { lastBlock: blockNumber },
      { upsert: true },
    );
    logger.debug(`Last block for feesCollected event set to ${blockNumber}`);
  }

  async getFeesCollectedLastBlock(): Promise<number | null> {
    const lastBlockDoc = await FeesCollectedLastBlockModel.findOne({});
    const lastBlock = lastBlockDoc?.lastBlock || null;
    logger.debug(`Last block for feesCollected event retrieved: ${lastBlock}`);
    return lastBlock;
  }

  async findFeesCollectedEventsByIntegrator(
    integrator: ParsedFeesCollectedEvent['integrator'],
  ): Promise<ParsedFeesCollectedEvent[]> {
    logger.info(`Finding feesCollected events for integrator: ${integrator}`);
    // TODO: Implementation for finding events by integrator in MongoDB like:
    // const events = await ParsedFeesCollectedEventModel.find({
    //   integrator,
    // });
    // return events.map((e) =>
    //   ParsedFeesCollectedEventMapper.toDomain(e),
    // );
    return [];
  }
}
