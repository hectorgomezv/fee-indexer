import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import type { ParsedFeesCollectedEvent } from '@domain/entities/parsed-fees-collected-event.entity.js';
import type { EVMClient as EVMClientInterface } from '@domain/repositories/evm-client.interface.js';
import { type BlockTag } from '@ethersproject/abstract-provider';
import { BigNumber, Contract, providers } from 'ethers';
import { FeeCollector__factory } from 'lifi-contract-typings';

export class EVMClient implements EVMClientInterface {
  private provider: providers.JsonRpcProvider;
  private contractAddress: string;

  // TODO: handle provider errors (429 etc.)

  constructor(chainConfig: ChainConfig) {
    this.provider = new providers.JsonRpcProvider(chainConfig.rpcUrl);
    this.contractAddress = chainConfig.contractAddress;
  }

  async fetchFeesCollectedEvents(
    fromBlock: BlockTag,
    toBlock: BlockTag,
  ): Promise<ParsedFeesCollectedEvent[]> {
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
  }

  async getLastBlockInChain(): Promise<number> {
    const block = await this.provider.getBlock('latest');
    if (!block) {
      throw new Error('Failed to fetch the latest block number');
    }
    return block.number;
  }
}
