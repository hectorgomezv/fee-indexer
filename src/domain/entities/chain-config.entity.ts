export interface ChainConfig {
  rpcUrl: string;
  contractAddress: string;
  blockDelta: number;
  initialBlockNumber: number;
  intervalMs: number;
}
