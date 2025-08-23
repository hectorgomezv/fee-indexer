import { EVMIndexerService } from '@application/services/evm-indexer.service.js';
import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import { randomBytes } from 'crypto';
import { BigNumber } from 'ethers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// TODO: builder?
let chainConfig: ChainConfig;
let evmClientMock: any;
let eventsRepositoryMock: any;
let evmIndexer: any;

describe('EVMIndexerService', () => {
  beforeEach(() => {
    chainConfig = {
      chainId: randomInt().toString(),
      chainName: 'testChain',
      rpcUrl: 'https://example.com',
      contractAddress: randomAddress(),
      blockDelta: randomInt(),
      initialBlockNumber: randomInt(),
      intervalMs: randomInt(),
    };
    evmClientMock = {
      fetchFeesCollectedEvents: vi.fn(),
      getLastBlockInChain: vi.fn(),
    };
    eventsRepositoryMock = {
      storeFeesCollectedEvents: vi.fn(),
      setFeesCollectedLastBlock: vi.fn(),
      getFeesCollectedLastBlock: vi.fn(),
    };
    evmIndexer = new EVMIndexerService(
      chainConfig,
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

// Utility functions for test data generation
const randomAddress = () => `0x${randomBytes(20).toString('hex')}`;
const randomInt = () => Math.floor(Math.random() * 1000);
const randomEvent = () => ({
  token: randomAddress(),
  integrator: randomAddress(),
  integratorFee: BigNumber.from(randomInt()),
  lifiFee: BigNumber.from(randomInt()),
});
const getRandomEvents = (maxEvents: number) =>
  Array.from({
    length: Math.floor(Math.random() * (maxEvents + 1)),
  }).map(() => randomEvent());
