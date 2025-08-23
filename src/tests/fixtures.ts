import type { ChainConfig } from '@domain/entities/chain-config.entity.js';
import { randomBytes } from 'crypto';
import { BigNumber } from 'ethers';

export const randomAddress = (): string =>
  `0x${randomBytes(20).toString('hex')}`;

export const randomInt = (): number => Math.floor(Math.random() * 1000);

export const getRandomEvents = (
  maxEvents: number,
): Array<ReturnType<typeof buildEvent>> =>
  Array.from({
    length: Math.floor(Math.random() * (maxEvents + 1)),
  }).map(() => buildEvent());

export const buildEvent = (): {
  token: string;
  integrator: string;
  integratorFee: BigNumber;
  lifiFee: BigNumber;
} => ({
  token: randomAddress(),
  integrator: randomAddress(),
  integratorFee: BigNumber.from(randomInt()),
  lifiFee: BigNumber.from(randomInt()),
});

export const buildChainConfig = (): ChainConfig => ({
  chainId: randomInt().toString(),
  chainName: 'testChain',
  rpcUrl: 'https://example.com',
  contractAddress: randomAddress(),
  blockDelta: randomInt(),
  initialBlockNumber: randomInt(),
  intervalMs: randomInt(),
});
