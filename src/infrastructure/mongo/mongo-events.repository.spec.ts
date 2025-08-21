import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MongoEventsRepository } from './mongo-events.repository';
import { ParsedFeesCollectedEventMapper } from './mappers/parsed-fees-collected-event.mapper';
import { ParsedFeesCollectedEventModel } from './models/parsed-fees-collected-event.model';
import { FeesCollectedLastBlockModel } from './models/fees-collected-last-block.model';
import { randomBytes } from 'crypto';

vi.mock('./models/parsed-fees-collected-event.model', () => ({
  ParsedFeesCollectedEventModel: {
    insertMany: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('./models/fees-collected-last-block.model', () => ({
  FeesCollectedLastBlockModel: {
    updateOne: vi.fn(),
    findOne: vi.fn(),
  },
}));

describe('MongoEventsRepository', () => {
  let repository: MongoEventsRepository;

  beforeEach(() => {
    repository = new MongoEventsRepository();
    vi.clearAllMocks();
  });

  describe('storeFeesCollectedEvents', () => {
    it('should insert mapped events into the database', async () => {
      const events = getRandomEvents(5);
      const mappedEvents = events.map((event) =>
        ParsedFeesCollectedEventMapper.toPersistence(event),
      );
      const insertMany = ParsedFeesCollectedEventModel.insertMany as ReturnType<
        typeof vi.fn
      >;
      insertMany.mockResolvedValue(mappedEvents);

      await repository.storeFeesCollectedEvents(events);

      expect(ParsedFeesCollectedEventModel.insertMany).toHaveBeenCalledWith(
        mappedEvents,
      );
    });

    it('should propagate errors', async () => {
      const insertMany = ParsedFeesCollectedEventModel.insertMany as ReturnType<
        typeof vi.fn
      >;
      insertMany.mockRejectedValue(new Error('Error message'));
      const events = getRandomEvents(2);

      await expect(repository.storeFeesCollectedEvents(events)).rejects.toThrow(
        'Error message',
      );
    });
  });

  describe('setFeesCollectedLastBlock', () => {
    it('should upsert the last block into the database', async () => {
      const blockNumber = 123;
      const updateOne = FeesCollectedLastBlockModel.updateOne as ReturnType<
        typeof vi.fn
      >;
      updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

      await repository.setFeesCollectedLastBlock(blockNumber);

      expect(FeesCollectedLastBlockModel.updateOne).toHaveBeenCalledWith(
        {},
        { lastBlock: blockNumber },
        { upsert: true },
      );
    });

    it('should propagate errors', async () => {
      const updateOne = FeesCollectedLastBlockModel.updateOne as ReturnType<
        typeof vi.fn
      >;
      updateOne.mockRejectedValue(new Error('Error message'));

      await expect(repository.setFeesCollectedLastBlock(123)).rejects.toThrow(
        'Error message',
      );
    });
  });

  describe('getFeesCollectedLastBlock', () => {
    it('should get the last block from the database', async () => {
      const findOne = FeesCollectedLastBlockModel.findOne as ReturnType<
        typeof vi.fn
      >;
      findOne.mockResolvedValue({ lastBlock: 123 });

      const result = await repository.getFeesCollectedLastBlock();

      expect(result).toEqual(123);
    });

    it('should return null if no last block is found', async () => {
      const findOne = FeesCollectedLastBlockModel.findOne as ReturnType<
        typeof vi.fn
      >;
      findOne.mockResolvedValue(null);

      const result = await repository.getFeesCollectedLastBlock();

      expect(result).toEqual(null);
    });

    it('should propagate errors', async () => {
      const findOne = FeesCollectedLastBlockModel.findOne as ReturnType<
        typeof vi.fn
      >;
      findOne.mockRejectedValue(new Error('Error message'));

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
