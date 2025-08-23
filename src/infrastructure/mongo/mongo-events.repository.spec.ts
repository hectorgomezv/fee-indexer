import { ParsedFeesCollectedEventMapper } from '@infrastructure/mongo/mappers/parsed-fees-collected-event.mapper.js';
import type { FeesCollectedLastBlockModel } from '@infrastructure/mongo/models/fees-collected-last-block.model.js';
import type { FeesCollectedEventModel } from '@infrastructure/mongo/models/parsed-fees-collected-event.model.js';
import { MongoEventsRepository } from '@infrastructure/mongo/mongo-events.repository.js';
import { getRandomEvents, randomInt } from '@tests/fixtures.js';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';

let feesCollectedEventsModelMock: Mocked<FeesCollectedEventModel>;
let feesCollectedLastBlockModelMock: Mocked<FeesCollectedLastBlockModel>;
let repository: MongoEventsRepository;

describe('MongoEventsRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    feesCollectedEventsModelMock = {
      insertMany: vi.fn(),
    } as unknown as Mocked<FeesCollectedEventModel>;
    feesCollectedLastBlockModelMock = {
      updateOne: vi.fn(),
      findOne: vi.fn(),
    } as unknown as Mocked<FeesCollectedLastBlockModel>;
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
