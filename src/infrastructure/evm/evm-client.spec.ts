import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EVMClient } from './evm-client';
import { type ChainConfig } from '../../domain/entities/chain-config.entity.js';
import { randomBytes } from 'crypto';

let contractMock: any;
let providerMock: any;

const randomAddress = () => `0x${randomBytes(20).toString('hex')}`;
const randomInt = () => Math.floor(Math.random() * 1000);

vi.mock('ethers', () => {
  return {
    BigNumber: {
      from: vi.fn((value) => value),
    },
    Contract: vi.fn(() => contractMock),
    providers: {
      JsonRpcProvider: vi.fn(() => providerMock),
    },
  };
});

describe('EVMClient', () => {
  const chainConfig: ChainConfig = {
    rpcUrl: 'https://example.com',
    contractAddress: randomAddress(),
    blockDelta: randomInt(),
    initialBlockNumber: randomInt(),
    intervalMs: randomInt(),
  };

  let client: EVMClient;

  beforeEach(() => {
    contractMock = {
      filters: { FeesCollected: vi.fn(() => 'filter') },
      queryFilter: vi.fn(),
      interface: { parseLog: vi.fn() },
    };
    providerMock = { getBlock: vi.fn() };
    client = new EVMClient(chainConfig);
  });

  describe('fetchFeeCollectorEvents', () => {
    it('should return parsed events', async () => {
      const fromBlock = randomInt();
      const toBlock = randomInt();
      const token = randomAddress();
      const integrator = randomAddress();
      const integratorFee = randomInt();
      const lifiFee = randomInt();
      contractMock.queryFilter.mockResolvedValue([
        { args: [token, integrator, integratorFee, lifiFee] },
      ]);
      contractMock.interface.parseLog.mockReturnValue({
        args: [token, integrator, integratorFee, lifiFee],
      });

      const result = await client.fetchFeeCollectorEvents(fromBlock, toBlock);

      expect(result).toEqual([
        {
          token,
          integrator,
          integratorFee,
          lifiFee,
        },
      ]);
      expect(contractMock.queryFilter).toHaveBeenCalledWith(
        'filter',
        fromBlock,
        toBlock,
      );
    });

    it('should return empty array if no events', async () => {
      const fromBlock = randomInt();
      const toBlock = randomInt();
      contractMock.queryFilter.mockResolvedValue([]);

      const result = await client.fetchFeeCollectorEvents(fromBlock, toBlock);

      expect(result).toEqual([]);
      expect(contractMock.queryFilter).toHaveBeenCalledWith(
        'filter',
        fromBlock,
        toBlock,
      );
    });
  });

  describe('getLastBlockNumber', () => {
    it('should return block number', async () => {
      const blockNumber = randomInt();
      providerMock.getBlock.mockResolvedValue({ number: blockNumber });

      const result = await client.getLastBlockNumber();

      expect(result).toBe(blockNumber);
      expect(providerMock.getBlock).toHaveBeenCalledWith('latest');
    });

    it('should throw if block is null', async () => {
      providerMock.getBlock.mockResolvedValue(null);
      await expect(client.getLastBlockNumber()).rejects.toThrow(
        'Failed to fetch the latest block number',
      );
    });
  });
});
