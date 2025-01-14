export interface DexConfig {
  name: string;
  address: string;
  router: string;
  type: 'Ekubo' | 'Avnu';
}

export interface PriceData {
  tokenAddress: string;
  priceInETH: bigint;
  priceInUSD: number;
  decimals: number;
}

export interface PoolData {
  address: string;
  token0: string;
  token1: string;
  reserve0: bigint;
  reserve1: bigint;
  fee: number;
}

export interface ArbitrageOpportunity {
  pair: string;
  buyDex: string;
  sellDex: string;
  spread: number;
  expectedProfit: number;
  gasEstimate: number;
}

export interface DexPrice {
  dexName: string;
  tokenPair: string;
  price: number;
  timestamp: number;
}
