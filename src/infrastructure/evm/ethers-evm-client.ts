import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';
import type { EVMClient } from '@domain/repositories/evm-client.interface.js';
import { type BlockTag } from '@ethersproject/abstract-provider';
import { ClientError } from '@infrastructure/evm/errors/client.error.js';
import { BigNumber, Contract, errors, providers } from 'ethers';
import { FeeCollector__factory } from 'lifi-contract-typings';

interface ProviderError {
  code?: string | number;
  status?: number;
  message?: string;
}

export class EthersEVMClient implements EVMClient {
  private provider: providers.JsonRpcProvider;
  private contractAddress: string;

  constructor(chainConfig: ChainConfig) {
    this.provider = new providers.JsonRpcProvider(chainConfig.rpcUrl);
    this.contractAddress = chainConfig.contractAddress;
  }

  async fetchFeesCollectedEvents(
    fromBlock: BlockTag,
    toBlock: BlockTag,
  ): Promise<ParsedFeesCollectedEvent[]> {
    try {
      const feeCollector = new Contract(
        this.contractAddress,
        FeeCollector__factory.createInterface(),
        this.provider,
      );
      const filter = feeCollector.filters.FeesCollected();
      const events = await feeCollector.queryFilter(filter, fromBlock, toBlock);
      return events.map((event) => {
        const parsedEvent = feeCollector.interface.parseLog(event);
        return {
          token: parsedEvent.args[0],
          integrator: parsedEvent.args[1],
          integratorFee: BigNumber.from(parsedEvent.args[2]),
          lifiFee: BigNumber.from(parsedEvent.args[3]),
        };
      });
    } catch (err) {
      if (this.isProviderError(err)) {
        throw new ClientError(err.status, err.code?.toString(), err.message);
      }
      throw err;
    }
  }

  async getLastBlockInChain(): Promise<number> {
    try {
      const block = await this.provider.getBlock('latest');
      if (!block) {
        throw new Error('Failed to fetch the latest block number');
      }
      return block.number;
    } catch (err) {
      if (this.isProviderError(err)) {
        throw new ClientError(err.status, err.code?.toString(), err.message);
      }
      throw err;
    }
  }

  private isProviderError(err: unknown): err is ProviderError {
    if (!err || typeof err !== 'object') return false;
    const e = err as ProviderError;
    return (
      e.status === 429 ||
      e.code === errors.NETWORK_ERROR ||
      e.code === errors.SERVER_ERROR ||
      e.code === errors.TIMEOUT
    );
  }
}
