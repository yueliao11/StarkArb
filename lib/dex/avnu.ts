import { Provider } from 'starknet';
import { DexConfig, PriceData, PoolData } from './types';
import { TESTNET } from '../config/contracts';
import axios from 'axios';

export const AVNU_CONFIG: DexConfig = {
  name: 'Avnu',
  address: TESTNET.AVNU.ROUTER,
  router: TESTNET.AVNU.ROUTER,
  type: 'Avnu'
};

interface AvnuQuote {
  sellAmount: string;
  buyAmount: string;
  estimatedGas: string;
  routes: Array<{
    dex: string;
    percentage: number;
    priceImpact: number;
  }>;
}

export class AvnuDex {
  private readonly config: DexConfig;
  private readonly provider: Provider;

  constructor(config: DexConfig = AVNU_CONFIG, provider: Provider) {
    this.config = config;
    this.provider = provider;
  }

  async getPools(): Promise<PoolData[]> {
    // TODO: Implement pool fetching
    return [];
  }

  async getPrice(tokenIn: string, tokenOut: string, amountIn: bigint): Promise<PriceData | null> {
    try {
      const response = await axios.get<AvnuQuote>(`${TESTNET.AVNU.API_BASE_URL}/v1/quote`, {
        params: {
          sellTokenAddress: tokenIn,
          buyTokenAddress: tokenOut,
          sellAmount: amountIn.toString(),
          chainId: TESTNET.CHAIN_ID,
        },
      });

      const quote = response.data;
      return {
        tokenAddress: tokenOut,
        price: BigInt(quote.buyAmount) / amountIn,
        timestamp: Date.now(),
        volume24h: 0n, // TODO: Implement volume tracking
        fee: 0n, // Fee is included in the quote
      };
    } catch (error) {
      console.error('Error fetching Avnu price:', error);
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
      throw new Error('Failed to get quote from Avnu');
    }

    return {
      amountOut: BigInt(Math.floor(Number(amountIn) * Number(quote.price))),
      fee: quote.fee
    };
  }

  async estimateGas(tokenIn: string, tokenOut: string, amountIn: bigint): Promise<bigint> {
    try {
      const response = await axios.get<AvnuQuote>(`${TESTNET.AVNU.API_BASE_URL}/v1/quote`, {
        params: {
          sellTokenAddress: tokenIn,
          buyTokenAddress: tokenOut,
          sellAmount: amountIn.toString(),
          chainId: TESTNET.CHAIN_ID,
        },
      });

      return BigInt(response.data.estimatedGas);
    } catch (error) {
      console.error('Error estimating gas:', error);
      // Default gas estimation if API call fails
      return 100000n;
    }
  }
}
