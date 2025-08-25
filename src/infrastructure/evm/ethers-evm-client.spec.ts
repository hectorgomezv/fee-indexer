import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import { EthersEVMClient } from '@infrastructure/evm/ethers-evm-client.js';
import { randomAddress, randomInt } from '@tests/fixtures.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let contractMock: any;
let providerMock: any;

vi.mock('ethers', () => {
  return {
    BigNumber: {
      from: vi.fn((value) => value),
    },
    Contract: vi.fn(() => contractMock),
    providers: {
      JsonRpcProvider: vi.fn(() => providerMock),
    },
    errors: {
      NETWORK_ERROR: 'NETWORK_ERROR',
      SERVER_ERROR: 'SERVER_ERROR',
      TIMEOUT: 'TIMEOUT',
    },
  };
});

describe('EVMClient', () => {
  const chainConfig: ChainConfig = {
    chainId: '1',
    chainName: 'Ethereum',
    rpcUrl: 'https://example.com',
    contractAddress: randomAddress(),
    blockDelta: randomInt(),
    initialBlockNumber: randomInt(),
    intervalMs: randomInt(),
  };

  let client: EthersEVMClient;

  beforeEach(() => {
    contractMock = {
      filters: { FeesCollected: vi.fn(() => 'filter') },
      queryFilter: vi.fn(),
      interface: { parseLog: vi.fn() },
    };
    providerMock = { getBlock: vi.fn() };
    client = new EthersEVMClient(chainConfig);
  });

  describe('fetchFeesCollectedEvents', () => {
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

      const result = await client.fetchFeesCollectedEvents(fromBlock, toBlock);

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

      const result = await client.fetchFeesCollectedEvents(fromBlock, toBlock);

      expect(result).toEqual([]);
      expect(contractMock.queryFilter).toHaveBeenCalledWith(
        'filter',
        fromBlock,
        toBlock,
      );
    });
  });

  describe('getLastBlockInChain', () => {
    it('should return block number', async () => {
      const blockNumber = randomInt();
      providerMock.getBlock.mockResolvedValue({ number: blockNumber });

      const result = await client.getLastBlockInChain();

      expect(result).toBe(blockNumber);
      expect(providerMock.getBlock).toHaveBeenCalledWith('latest');
    });

    it('should throw if block is null', async () => {
      providerMock.getBlock.mockResolvedValue(null);
      await expect(client.getLastBlockInChain()).rejects.toThrow(
        'Failed to fetch the latest block number',
      );
    });
  });
});
