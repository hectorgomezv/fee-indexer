import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import { EVMScheduler } from '@infrastructure/jobs/evm-indexer.scheduler.js';
import { randomBytes } from 'crypto';
import { BigNumber } from 'ethers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let indexerService: any;
let scheduler: EVMScheduler;

describe('EVMScheduler', () => {
  beforeEach(() => {
    indexerService = {
      getLastBlockInChain: vi.fn(),
      getLastIndexedBlockNumber: vi.fn(),
      indexFeeCollectionEvents: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should index [initialBlockNumber -> (initialBlockNumber + delta)] if (lastIndexedBlockNumber < initialBlockNumber)', async () => {
    indexerService.getLastBlockInChain.mockResolvedValue(1_000);
    indexerService.getLastIndexedBlockNumber.mockResolvedValue(100);
    const chainConfig = {
      chainId: randomInt().toString(),
      chainName: 'testChain',
      rpcUrl: 'https://example.com',
      contractAddress: randomAddress(),
      blockDelta: 10,
      initialBlockNumber: 200,
      intervalMs: 1000,
    };
    scheduler = new EVMScheduler(indexerService, chainConfig);

    const nextBlock = await scheduler.indexJob();

    expect(nextBlock).toBe(210);
    expect(indexerService.indexFeeCollectionEvents).toHaveBeenCalledWith(
      200,
      209,
    );
  });

  it('should index [initialBlockNumber -> (initialBlockNumber + delta)] if lastIndexedBlockNumber does not exist', async () => {
    indexerService.getLastBlockInChain.mockResolvedValue(1_000);
    indexerService.getLastIndexedBlockNumber.mockResolvedValue(null);
    const chainConfig = {
      chainId: randomInt().toString(),
      chainName: 'testChain',
      rpcUrl: 'https://example.com',
      contractAddress: randomAddress(),
      blockDelta: 10,
      initialBlockNumber: 200,
      intervalMs: 1000,
    };
    scheduler = new EVMScheduler(indexerService, chainConfig);

    const nextBlock = await scheduler.indexJob();

    expect(nextBlock).toBe(210);
    expect(indexerService.indexFeeCollectionEvents).toHaveBeenCalledWith(
      200,
      209,
    );
  });

  it('should index [lastIndexedBlockNumber -> lastIndexedBlockNumber + delta] if (lastIndexedBlockNumber >= initialBlockNumber)', async () => {
    indexerService.getLastBlockInChain.mockResolvedValue(1_000);
    indexerService.getLastIndexedBlockNumber.mockResolvedValue(299);
    const chainConfig = {
      chainId: randomInt().toString(),
      chainName: 'testChain',
      rpcUrl: 'https://example.com',
      contractAddress: randomAddress(),
      blockDelta: 10,
      initialBlockNumber: 200,
      intervalMs: 1000,
    };
    scheduler = new EVMScheduler(indexerService, chainConfig);

    const nextBlock = await scheduler.indexJob();

    expect(nextBlock).toBe(310);
    expect(indexerService.indexFeeCollectionEvents).toHaveBeenCalledWith(
      300,
      309,
    );
  });

  it('should index [lastIndexedBlockNumber -> latestBlockInChain] if (lastIndexedBlockNumber + delta >= latestBlockInChain)', async () => {
    indexerService.getLastBlockInChain.mockResolvedValue(1_000);
    indexerService.getLastIndexedBlockNumber.mockResolvedValue(995);
    const chainConfig = {
      chainId: randomInt().toString(),
      chainName: 'testChain',
      rpcUrl: 'https://example.com',
      contractAddress: randomAddress(),
      blockDelta: 10,
      initialBlockNumber: 200,
      intervalMs: 1000,
    };
    scheduler = new EVMScheduler(indexerService, chainConfig);

    const nextBlock = await scheduler.indexJob();

    expect(nextBlock).toBe(1_000); // next block is capped to last block in chain
    expect(indexerService.indexFeeCollectionEvents).toHaveBeenCalledWith(
      996,
      1_000,
    );
  });
});

// TODO: extract this
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
