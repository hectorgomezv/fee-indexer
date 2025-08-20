import { BigNumber } from 'ethers';

export interface ParsedFeeCollectorEvent {
  token: string;
  integrator: string;
  integratorFee: BigNumber;
  lifiFee: BigNumber;
}
