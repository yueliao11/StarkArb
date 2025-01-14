import { z } from 'zod';
import { TESTNET } from '../config/contracts';
import { AvnuClient } from '@avnu/avnu-sdk';
import { formatUnits, parseUnits } from 'ethers';

// 定义网络类型
type Network = 'mainnet' | 'goerli';

// 创建 SDK 实例
const createAvnuClient = () => {
  if (typeof window === 'undefined') {
    return null; // 服务器端返回 null
  }
  
  return new AvnuClient({
    apiKey: process.env.NEXT_PUBLIC_AVNU_API_KEY || '',
    network: (process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'mainnet' : 'goerli') as Network
  });
};

// 延迟初始化 SDK
let client: AvnuClient | null = null;

// Response schemas
const GasTokenPriceSchema = z.object({
  address: z.string(),
  decimals: z.number(),
  name: z.string(),
  symbol: z.string(),
  usdPrice: z.string()
});

const QuoteResponseSchema = z.object({
  routes: z.array(z.object({
    quote: z.object({
      amountIn: z.string(),
      amountOut: z.string(),
      priceImpact: z.string(),
      route: z.array(z.string())
    })
  }))
});

export const avnuApi = {
  getClient() {
    if (!client) {
      client = createAvnuClient();
    }
    return client;
  },

  async getGasTokenPrices() {
    try {
      const avnuClient = this.getClient();
      if (!avnuClient) {
        throw new Error('Client not initialized');
      }

      const gasTokens = await avnuClient.getGasTokens();
      return gasTokens.map(token => ({
        address: token.address,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        usdPrice: token.usdPrice?.toString() || '0'
      }));
    } catch (error) {
      console.error('Error fetching gas token prices:', error);
      return [{
        address: TESTNET.TOKENS.ETH,
        decimals: 18,
        name: 'Ethereum',
        symbol: 'ETH',
        usdPrice: '2000'
      }];
    }
  },

  async getQuote(params: {
    tokenIn: string;
    tokenOut: string;
    amount: string;
    recipient?: string;
    slippage?: number;
  }) {
    try {
      const avnuClient = this.getClient();
      if (!avnuClient) {
        throw new Error('Client not initialized');
      }

      const quoteRequest = {
        sellTokenAddress: params.tokenIn,
        buyTokenAddress: params.tokenOut,
        sellAmount: params.amount,
        takerAddress: params.recipient,
        slippagePercentage: params.slippage || 0.5
      };

      const quotes = await avnuClient.getQuotes(quoteRequest);
      
      if (!quotes || quotes.length === 0) {
        throw new Error('No quotes available');
      }

      return {
        routes: quotes.map(quote => ({
          quote: {
            amountIn: quote.sellAmount?.toString() || '0',
            amountOut: quote.buyAmount?.toString() || '0',
            priceImpact: quote.priceImpact?.toString() || '0',
            route: quote.route || []
          }
        }))
      };
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  },

  async buildSwapTransaction(params: {
    tokenIn: string;
    tokenOut: string;
    amount: string;
    recipient: string;
    slippage?: number;
  }) {
    try {
      const avnuClient = this.getClient();
      if (!avnuClient) {
        throw new Error('Client not initialized');
      }

      const quotes = await this.getQuote(params);
      const bestQuote = quotes.routes[0];
      
      const swapParams = {
        quote: bestQuote,
        takerAddress: params.recipient,
        slippagePercentage: params.slippage || 0.5
      };

      const transaction = await avnuClient.buildTransaction(swapParams);
      return transaction;
    } catch (error) {
      console.error('Error building swap transaction:', error);
      throw error;
    }
  },

  async executeTransaction(params: {
    userAddress: string;
    typedData: string;
    signature: string[];
  }) {
    try {
      const avnuClient = this.getClient();
      if (!avnuClient) {
        throw new Error('Client not initialized');
      }

      const result = await avnuClient.executeTransaction({
        takerAddress: params.userAddress,
        typedData: params.typedData,
        signature: params.signature
      });
      return result;
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw error;
    }
  },

  async getTransactionStatus(transactionHash: string) {
    try {
      const avnuClient = this.getClient();
      if (!avnuClient) {
        throw new Error('Client not initialized');
      }

      const status = await avnuClient.getTransactionStatus(transactionHash);
      return status;
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }
};