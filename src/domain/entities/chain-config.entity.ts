export interface ChainConfig {
  chainId: string;
  chainName: string;
  rpcUrl: string;
  contractAddress: string;
  blockDelta: number;
  initialBlockNumber: number;
  intervalMs: number;
  blockConfirmationsThreshold: number;
}
