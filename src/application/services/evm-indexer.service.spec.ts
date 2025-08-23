import { EVMIndexerService } from '@application/services/evm-indexer.service.js';
import type { EventsRepository } from '@domain/repositories/events.repository.interface.js';
import type { EVMClient } from '@infrastructure/evm/evm-client.js';
import {
  buildChainConfig,
  getRandomEvents,
  randomInt,
} from '@tests/fixtures.js';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';

let evmClientMock: Mocked<EVMClient>;
let eventsRepositoryMock: Mocked<EventsRepository>;
let evmIndexer: EVMIndexerService;

describe('EVMIndexerService', () => {
  beforeEach(() => {
    evmClientMock = {
      fetchFeesCollectedEvents: vi.fn(),
      getLastBlockInChain: vi.fn(),
    } as unknown as Mocked<EVMClient>;
    eventsRepositoryMock = {
      storeFeesCollectedEvents: vi.fn(),
      setFeesCollectedLastBlock: vi.fn(),
      getFeesCollectedLastBlock: vi.fn(),
    } as unknown as Mocked<EventsRepository>;
    evmIndexer = new EVMIndexerService(
      buildChainConfig(),
      evmClientMock,
      eventsRepositoryMock,
    );
  });

  describe('indexFeeCollectionEvents', () => {
    it('should index fee collection events and set the last block', async () => {
      const fromBlock = randomInt();
      const toBlock = randomInt();
      const events = getRandomEvents(5);
      evmClientMock.fetchFeesCollectedEvents.mockResolvedValue(events);
      await evmIndexer.indexFeeCollectionEvents(fromBlock, toBlock);
      expect(evmClientMock.fetchFeesCollectedEvents).toHaveBeenCalledWith(
        fromBlock,
        toBlock,
      );
      expect(
        eventsRepositoryMock.storeFeesCollectedEvents,
      ).toHaveBeenCalledWith(events);
      expect(
        eventsRepositoryMock.setFeesCollectedLastBlock,
      ).toHaveBeenCalledWith(toBlock);
    });

    it('should propagate errors from fetchFeesCollectedEvents', async () => {
      evmClientMock.fetchFeesCollectedEvents.mockRejectedValue(
        new Error('Error message'),
      );
      await expect(
        evmIndexer.indexFeeCollectionEvents(randomInt(), randomInt()),
      ).rejects.toThrow('Error message');
    });

    it('should propagate errors from storeFeesCollectedEvents', async () => {
      eventsRepositoryMock.storeFeesCollectedEvents.mockRejectedValue(
        new Error('Error message'),
      );
      await expect(
        evmIndexer.indexFeeCollectionEvents(randomInt(), randomInt()),
      ).rejects.toThrow('Error message');
    });

    it('should propagate errors from setFeesCollectedLastBlock', async () => {
      eventsRepositoryMock.setFeesCollectedLastBlock.mockRejectedValue(
        new Error('Error message'),
      );
      await expect(
        evmIndexer.indexFeeCollectionEvents(randomInt(), randomInt()),
      ).rejects.toThrow('Error message');
    });
  });

  describe('getLastBlockInChain', () => {
    it('should return the last block number', async () => {
      const lastBlockNumber = randomInt();
      evmClientMock.getLastBlockInChain.mockResolvedValue(lastBlockNumber);
      const result = await evmIndexer.getLastBlockInChain();
      expect(result).toBe(lastBlockNumber);
      expect(evmClientMock.getLastBlockInChain).toHaveBeenCalled();
    });

    it('should propagate errors from getLastBlockInChain', async () => {
      evmClientMock.getLastBlockInChain.mockRejectedValue(
        new Error('Error message'),
      );
      await expect(evmIndexer.getLastBlockInChain()).rejects.toThrow(
        'Error message',
      );
    });
  });

  describe('getLastIndexedBlockNumber', () => {
    it('should return the last indexed block number', async () => {
      const lastIndexedBlockNumber = randomInt();
      eventsRepositoryMock.getFeesCollectedLastBlock.mockResolvedValue(
        lastIndexedBlockNumber,
      );
      const result = await evmIndexer.getLastIndexedBlockNumber();
      expect(result).toBe(lastIndexedBlockNumber);
      expect(eventsRepositoryMock.getFeesCollectedLastBlock).toHaveBeenCalled();
    });

    it('should propagate errors from getFeesCollectedLastBlock', async () => {
      eventsRepositoryMock.getFeesCollectedLastBlock.mockRejectedValue(
        new Error('Error message'),
      );
      await expect(evmIndexer.getLastIndexedBlockNumber()).rejects.toThrow(
        'Error message',
      );
    });
  });
});
