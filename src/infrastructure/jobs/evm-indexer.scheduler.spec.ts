import type { EVMIndexerService } from '@application/services/evm-indexer.service.js';
import { ClientError } from '@infrastructure/evm/errors/client.error.js';
import { EVMScheduler } from '@infrastructure/jobs/evm-indexer.scheduler.js';
import { buildChainConfig } from '@tests/fixtures.js';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';

let indexerService: Mocked<EVMIndexerService>;
let scheduler: EVMScheduler;

describe('EVMScheduler', () => {
  beforeEach(() => {
    indexerService = {
      getLastBlockInChain: vi.fn(),
      getLastIndexedBlockNumber: vi.fn(),
      indexFeeCollectionEvents: vi.fn(),
    } as unknown as Mocked<EVMIndexerService>;
    vi.clearAllMocks();
  });

  it('should index [initialBlockNumber -> (initialBlockNumber + delta)] if (lastIndexedBlockNumber < initialBlockNumber)', async () => {
    indexerService.getLastBlockInChain.mockResolvedValue(1_000);
    indexerService.getLastIndexedBlockNumber.mockResolvedValue(100);
    scheduler = new EVMScheduler(indexerService, {
      ...buildChainConfig(),
      blockDelta: 10,
      initialBlockNumber: 200,
    });
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
    scheduler = new EVMScheduler(indexerService, {
      ...buildChainConfig(),
      blockDelta: 50,
      initialBlockNumber: 100,
    });
    const nextBlock = await scheduler.indexJob();
    expect(nextBlock).toBe(150);
    expect(indexerService.indexFeeCollectionEvents).toHaveBeenCalledWith(
      100,
      149,
    );
  });

  it('should index [lastIndexedBlockNumber -> lastIndexedBlockNumber + delta] if (lastIndexedBlockNumber >= initialBlockNumber)', async () => {
    indexerService.getLastBlockInChain.mockResolvedValue(1_000);
    indexerService.getLastIndexedBlockNumber.mockResolvedValue(299);
    scheduler = new EVMScheduler(indexerService, {
      ...buildChainConfig(),
      blockDelta: 10,
      initialBlockNumber: 200,
    });
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
    scheduler = new EVMScheduler(indexerService, {
      ...buildChainConfig(),
      blockDelta: 10,
      initialBlockNumber: 200,
    });
    const nextBlock = await scheduler.indexJob();
    expect(nextBlock).toBe(1_000); // next block is capped to last block in chain
    expect(indexerService.indexFeeCollectionEvents).toHaveBeenCalledWith(
      996,
      1_000, // upper limit is capped to last block in chain
    );
  });

  it('should log an error and return the previous nextBlock if a ClientError occurs', async () => {
    indexerService.getLastBlockInChain.mockRejectedValue(
      new ClientError(429, 'NETWORK_ERROR', 'Rate limit exceeded'),
    );
    indexerService.getLastIndexedBlockNumber.mockResolvedValue(995);
    scheduler = new EVMScheduler(indexerService, {
      ...buildChainConfig(),
      blockDelta: 10,
      initialBlockNumber: 200,
    });
    const nextBlock = await scheduler.indexJob();
    expect(nextBlock).toBe(200); // next block stays at previous nextBlock
  });
});
