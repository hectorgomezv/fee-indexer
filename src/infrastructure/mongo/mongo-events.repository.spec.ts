import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MongoEventsRepository } from './mongo-events.repository';
import { ParsedFeesCollectedEventMapper } from './mappers/parsed-fees-collected-event.mapper';
import { ParsedFeesCollectedEventModel } from './models/parsed-fees-collected-event.model';
import { FeesCollectedLastBlockModel } from './models/fees-collected-last-block.model';
import { randomBytes } from 'crypto';

describe('MongoEventsRepository', () => {
  let repository: MongoEventsRepository;

  beforeEach(() => {
    repository = new MongoEventsRepository();
    vi.restoreAllMocks();
  });

  describe('storeFeesCollectedEvents', () => {
    it('should insert mapped events into the database', async () => {
      const events = getRandomEvents(5);
      const mappedEvents = events.map((event) =>
        ParsedFeesCollectedEventMapper.toPersistence(event),
      );
      const insertManySpy = vi
        .spyOn(ParsedFeesCollectedEventModel, 'insertMany')
        .mockResolvedValue(undefined as any);

      await repository.storeFeesCollectedEvents(events);

      expect(insertManySpy).toHaveBeenCalledWith(mappedEvents);
    });

    it('should propagate errors', async () => {
      const events = getRandomEvents(2);
      vi.spyOn(ParsedFeesCollectedEventModel, 'insertMany').mockRejectedValue(
        new Error('Error message'),
      );

      await expect(repository.storeFeesCollectedEvents(events)).rejects.toThrow(
        'Error message',
      );
    });
  });

  describe('setFeesCollectedLastBlock', () => {
    it('should upsert the last block into the database', async () => {
      const blockNumber = 123;
      const updateOneSpy = vi
        .spyOn(FeesCollectedLastBlockModel, 'updateOne')
        .mockResolvedValue(undefined as any);

      await repository.setFeesCollectedLastBlock(blockNumber);

      expect(updateOneSpy).toHaveBeenCalledWith(
        {},
        { lastBlock: blockNumber },
        { upsert: true },
      );
    });

    it('should propagate errors', async () => {
      vi.spyOn(FeesCollectedLastBlockModel, 'updateOne').mockRejectedValue(
        new Error('Error message'),
      );

      await expect(repository.setFeesCollectedLastBlock(123)).rejects.toThrow(
        'Error message',
      );
    });
  });

  describe('getFeesCollectedLastBlock', () => {
    it('should get the last block from the database', async () => {
      vi.spyOn(FeesCollectedLastBlockModel, 'findOne').mockResolvedValue({
        lastBlock: 123,
      });

      const result = await repository.getFeesCollectedLastBlock();

      expect(result).toEqual(123);
    });

    it('should return null if no last block is found', async () => {
      vi.spyOn(FeesCollectedLastBlockModel, 'findOne').mockResolvedValue(null);

      const result = await repository.getFeesCollectedLastBlock();

      expect(result).toEqual(null);
    });

    it('should propagate errors', async () => {
      vi.spyOn(FeesCollectedLastBlockModel, 'findOne').mockRejectedValue(
        new Error('Error message'),
      );

      await expect(repository.getFeesCollectedLastBlock()).rejects.toThrow(
        'Error message',
      );
    });
  });
});

// Utility functions for test data generation
const randomAddress = () => `0x${randomBytes(20).toString('hex')}`;
const randomInt = () => Math.floor(Math.random() * 1000);
const randomEvent = () => ({
  token: randomAddress(),
  integrator: randomAddress(),
  integratorFee: randomInt(),
  lifiFee: randomInt(),
});
const getRandomEvents = (maxEvents: number) =>
  Array.from({
    length: Math.floor(Math.random() * (maxEvents + 1)),
  }).map(() => randomEvent());
