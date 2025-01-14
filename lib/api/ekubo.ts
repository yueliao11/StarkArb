import { z } from 'zod';
import { Contract } from 'starknet';
import { TESTNET } from '../config/contracts';

const EKUBO_MAINNET = 'https://mainnet-api.ekubo.org';
const EKUBO_TESTNET = 'https://sepolia-api.ekubo.org';

// Ekubo ABI
const EKUBO_POOL_ABI = [
  {
    name: 'get_pool_info',
    type: 'function',
    inputs: [],
    outputs: [
      { name: 'liquidity', type: 'u256' },
      { name: 'token', type: 'felt' },
      { name: 'price', type: 'u256' },
      { name: 'volume24h', type: 'u256' },
    ],
  },
];

// 更新 Schema 以匹配实际 API 响应
const PoolSchema = z.object({
  id: z.string(),
  token: z.string(),
  symbol: z.string(),
  decimals: z.number().optional(),
  liquidity: z.string().optional(),
  volume24h: z.string().optional(),
  price: z.number().optional()
}).passthrough()

const PoolStatsSchema = z.object({
  id: z.string(),
  price: z.number(),
  liquidity: z.string().optional(),
  volume24h: z.string().optional(),
  fees24h: z.string().optional(),
  tvl: z.string().optional()
}).passthrough()

export type Pool = z.infer<typeof PoolSchema>
export type PoolStats = z.infer<typeof PoolStatsSchema>

export const ekuboApi = {
  baseUrl: process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? EKUBO_MAINNET : EKUBO_TESTNET,

  async getPools(): Promise<Pool[]> {
    try {
      // 由于 API 还未完全就绪，使用模拟数据
      return [
        {
          id: 'eth-usdt-pool',
          token: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
          symbol: 'ETH/USDT',
          decimals: 18,
          price: 3450.25,
          volume24h: '1200000',
          liquidity: '5000000'
        },
        {
          id: 'btc-usdt-pool',
          token: '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac',
          symbol: 'BTC/USDT',
          decimals: 18,
          price: 65750.80,
          volume24h: '2500000',
          liquidity: '8000000'
        },
        {
          id: 'stark-usdt-pool',
          token: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
          symbol: 'STARK/USDT',
          decimals: 18,
          price: 4.25,
          volume24h: '500000',
          liquidity: '1000000'
        }
      ];
    } catch (error) {
      console.error('Error fetching pools:', error);
      return [];
    }
  },

  async getPoolStats(poolId: string): Promise<PoolStats | null> {
    try {
      // 使用模拟数据
      const mockStats: Record<string, PoolStats> = {
        'eth-usdt-pool': {
          id: 'eth-usdt-pool',
          price: 3450.25,
          liquidity: '5000000',
          volume24h: '1200000',
          fees24h: '1000',
          tvl: '5000000'
        },
        'btc-usdt-pool': {
          id: 'btc-usdt-pool',
          price: 65750.80,
          liquidity: '8000000',
          volume24h: '2500000',
          fees24h: '2000',
          tvl: '8000000'
        },
        'stark-usdt-pool': {
          id: 'stark-usdt-pool',
          price: 4.25,
          liquidity: '1000000',
          volume24h: '500000',
          fees24h: '500',
          tvl: '1000000'
        }
      };

      return mockStats[poolId] || null;
    } catch (error) {
      console.error('Error fetching pool stats:', error);
      return null;
    }
  },

  async getTokenPrice(tokenAddress: string): Promise<number> {
    try {
      // 使用模拟数据
      const mockPrices: Record<string, number> = {
        '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7': 3475.50, // ETH
        '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac': 65900.25, // BTC
        '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d': 4.35, // STARK
      };

      return mockPrices[tokenAddress] || 0;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  },

  async getQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint
  ): Promise<{
    amountOut: bigint;
    priceImpact: number;
    fee: bigint;
  }> {
    try {
      // 模拟报价计算
      const tokenInPrice = await this.getTokenPrice(tokenIn);
      const tokenOutPrice = await this.getTokenPrice(tokenOut);
      
      if (!tokenInPrice || !tokenOutPrice) {
        throw new Error('Invalid token pair');
      }

      const amountInFloat = Number(amountIn) / 1e18;
      const rate = tokenInPrice / tokenOutPrice;
      const baseAmountOut = BigInt(Math.floor(amountInFloat * rate * 1e18));
      
      // 模拟滑点和手续费
      const priceImpact = amountInFloat > 10000 ? 0.005 : 0.001; // 大额交易滑点更大
      const fee = baseAmountOut * BigInt(3) / BigInt(1000); // 0.3% 手续费

      return {
        amountOut: baseAmountOut - fee,
        priceImpact,
        fee
      };
    } catch (error) {
      console.error('Error getting quote:', error);
      throw error;
    }
  },

  async buildSwapTransaction(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    minAmountOut: bigint
  ): Promise<{
    contractAddress: string;
    entrypoint: string;
    calldata: string[];
  }> {
    return {
      contractAddress: TESTNET.EKUBO.ROUTER,
      entrypoint: 'swap',
      calldata: [
        tokenIn,
        tokenOut,
        amountIn.toString(),
        minAmountOut.toString(),
      ],
    };
  },
};