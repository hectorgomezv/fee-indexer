import { type BlockTag } from '@ethersproject/abstract-provider';
import type { ParsedFeeCollectorEvent } from 'domain/entities/parsed-fee-collector-event.entity.js';
import type { EVMClient } from 'domain/repositories/evm.client.js';
import { BigNumber, ethers } from 'ethers';
import { FeeCollector__factory } from 'lifi-contract-typings';

export class PolygonEVMClient implements EVMClient {
  // TODO: extract to configuration
  private static CONTRACT_ADDRESS =
    '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9';
  private static POLYGON_RPC = 'https://polygon-rpc.com';

  async fetchFeeCollectorEvents(
    fromBlock: BlockTag,
    toBlock: BlockTag,
  ): Promise<ParsedFeeCollectorEvent[]> {
    const feeCollector = new ethers.Contract(
      PolygonEVMClient.CONTRACT_ADDRESS,
      FeeCollector__factory.createInterface(),
      new ethers.providers.JsonRpcProvider(PolygonEVMClient.POLYGON_RPC),
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
}
