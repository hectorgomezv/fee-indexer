import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import { EVMScheduler } from '@infrastructure/jobs/evm-indexer.scheduler.js';
import { randomBytes } from 'crypto';
import { BigNumber } from 'ethers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let indexerService: any;
let scheduler: EVMScheduler;
let chainConfig: ChainConfig;

describe('EVMScheduler', () => {
  beforeEach(() => {
    indexerService = {
      getLastBlockNumber: vi.fn(),
      getLastIndexedBlockNumber: vi.fn(),
      indexFeeCollectionEvents: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should index from the configured initialBlockNumber to the chain lastBlockNumber if (lastIndexedBlockNumber < initialBlockNumber)', async () => {
    indexerService.getLastBlockNumber.mockResolvedValue(1_000);
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

  it('should index from the lastIndexedBlockNumber to the chain lastBlockNumber if (lastIndexedBlockNumber >= initialBlockNumber)', async () => {
    indexerService.getLastBlockNumber.mockResolvedValue(1_000);
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
