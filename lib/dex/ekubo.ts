import { Contract, Provider } from 'starknet';
import { DexConfig, PriceData, PoolData } from './types';
import { TESTNET } from '../config/contracts';

export const EKUBO_CONFIG: DexConfig = {
  name: 'Ekubo',
  address: TESTNET.EKUBO.CORE,
  router: TESTNET.EKUBO.ROUTER,
  type: 'Ekubo'
};

// Ekubo ABI
const EKUBO_ABI = [
  {
    name: 'get_quote',
    type: 'function',
    inputs: [
      { name: 'token_in', type: 'felt' },
      { name: 'token_out', type: 'felt' },
      { name: 'amount_in', type: 'u256' },
    ],
    outputs: [
      { name: 'amount_out', type: 'u256' },
      { name: 'fee', type: 'u256' },
    ],
  },
];

export class EkuboDex {
  private readonly config: DexConfig;
  private readonly quoterContract: Contract;
  private readonly provider: Provider;

  constructor(config: DexConfig = EKUBO_CONFIG, provider: Provider) {
    this.config = config;
    this.provider = provider;
    this.quoterContract = new Contract(EKUBO_ABI, TESTNET.EKUBO.QUOTER, provider);
  }

  async getPools(): Promise<PoolData[]> {
    // TODO: Implement pool fetching using Core contract
    return [];
  }

  async getPrice(tokenIn: string, tokenOut: string, amountIn: bigint): Promise<PriceData | null> {
    try {
      const result = await this.quoterContract.call('get_quote', [
        tokenIn,
        tokenOut,
        amountIn.toString()
      ]);

      return {
        tokenAddress: tokenOut,
        price: BigInt(result.amount_out) / amountIn,
        timestamp: Date.now(),
        volume24h: 0n, // TODO: Implement volume tracking
        fee: BigInt(result.fee)
      };
    } catch (error) {
      console.error('Error fetching Ekubo price:', error);
      return null;
    }
  }

  async estimateSwap(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint
  ): Promise<{
    amountOut: bigint;
    fee: bigint;
  }> {
    const quote = await this.getPrice(tokenIn, tokenOut, amountIn);
    if (!quote) {
      throw new Error('Failed to get quote from Ekubo');
    }

    return {
      amountOut: BigInt(Math.floor(Number(amountIn) * Number(quote.price))),
      fee: quote.fee
    };
  }

  // Gas estimation based on Ekubo docs
  async estimateGas(tokenIn: string, tokenOut: string, amountIn: bigint): Promise<bigint> {
    // Ekubo's gas estimation is typically around 50,000 gas units for a swap
    return 50000n;
  }

  buildSwapTransaction(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    minAmountOut: bigint
  ): {
    contractAddress: string;
    entrypoint: string;
    calldata: string[];
  } {
    // Build swap transaction calldata
    return {
      contractAddress: this.config.router,
      entrypoint: 'swap',
      calldata: []
    };
  }
}
