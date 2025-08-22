import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MongoEventsRepository } from './mongo-events.repository';
import { ParsedFeesCollectedEventMapper } from './mappers/parsed-fees-collected-event.mapper';
import { randomBytes } from 'crypto';

let feesCollectedEventsModelMock: any;
let feesCollectedLastBlockModelMock: any;
let repository: MongoEventsRepository;

describe('MongoEventsRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    feesCollectedEventsModelMock = { insertMany: vi.fn() };
    feesCollectedLastBlockModelMock = {
      updateOne: vi.fn(),
      findOne: vi.fn(),
    };
    repository = new MongoEventsRepository(
      feesCollectedLastBlockModelMock,
      feesCollectedEventsModelMock,
    );
  });

  describe('storeFeesCollectedEvents', () => {
    it('should insert mapped events into the database', async () => {
      const events = getRandomEvents(5);
      const mappedEvents = events.map((event) =>
        ParsedFeesCollectedEventMapper.toPersistence(event),
      );
      await repository.storeFeesCollectedEvents(events);
      expect(feesCollectedEventsModelMock.insertMany).toHaveBeenCalledWith(
        mappedEvents,
      );
    });

    it('should propagate errors', async () => {
      const events = getRandomEvents(2);
      feesCollectedEventsModelMock.insertMany.mockRejectedValue(
        new Error('Error message'),
      );
      await expect(repository.storeFeesCollectedEvents(events)).rejects.toThrow(
        'Error message',
      );
    });
  });

  describe('setFeesCollectedLastBlock', () => {
    it('should upsert the last block into the database', async () => {
      const blockNumber = randomInt();
      await repository.setFeesCollectedLastBlock(blockNumber);
      expect(feesCollectedLastBlockModelMock.updateOne).toHaveBeenCalledWith(
        {},
        { lastBlock: blockNumber },
        { upsert: true },
      );
    });

    it('should propagate errors', async () => {
      feesCollectedLastBlockModelMock.updateOne.mockRejectedValue(
        new Error('Error message'),
      );
      await expect(
        repository.setFeesCollectedLastBlock(randomInt()),
      ).rejects.toThrow('Error message');
    });
  });

  describe('getFeesCollectedLastBlock', () => {
    it('should get the last block from the database', async () => {
      const blockNumber = randomInt();
      feesCollectedLastBlockModelMock.findOne.mockResolvedValue({
        lastBlock: blockNumber,
      });
      const result = await repository.getFeesCollectedLastBlock();
      expect(result).toEqual(blockNumber);
    });

    it('should return null if no last block is found', async () => {
      feesCollectedLastBlockModelMock.findOne.mockResolvedValue(null);
      const result = await repository.getFeesCollectedLastBlock();
      expect(result).toEqual(null);
    });

    it('should propagate errors', async () => {
      feesCollectedLastBlockModelMock.findOne.mockRejectedValue(
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
