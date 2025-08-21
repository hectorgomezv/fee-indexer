import { type BigNumber } from 'ethers';

export interface ParsedFeesCollectedEvent {
  token: string;
  integrator: string;
  integratorFee: BigNumber;
  lifiFee: BigNumber;
}
