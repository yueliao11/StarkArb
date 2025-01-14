import { Provider, Account } from 'starknet';
import { EkuboDex } from '../dex/ekubo';
import { AvnuDex } from '../dex/avnu';
import { ArbitrageOpportunity } from './price-monitor';
import { ARBITRAGE_CONFIG } from '../config/arbitrage';
import { executeCalls } from '@avnu/gasless-sdk';

export class ArbitrageExecutor {
  private readonly ekubo: EkuboDex;
  private readonly avnu: AvnuDex;
  private readonly provider: Provider;
  private readonly account: Account;

  constructor(provider: Provider, account: Account) {
    this.provider = provider;
    this.account = account;
    this.ekubo = new EkuboDex(undefined, provider);
    this.avnu = new AvnuDex(undefined, provider);
  }

  async executeArbitrage(opportunity: ArbitrageOpportunity): Promise<string | null> {
    try {
      // 检查滑点和最小利润
      const profitAfterSlippage = opportunity.expectedProfit * BigInt(100 - ARBITRAGE_CONFIG.SLIPPAGE_TOLERANCE) / 100n;
      
      if (profitAfterSlippage < ARBITRAGE_CONFIG.MIN_PROFIT_AFTER_GAS) {
        console.log('Profit after slippage too low');
        return null;
      }

      // 构建交易
      const buyCall = opportunity.buyDex === 'Ekubo' ?
        await this.ekubo.buildSwapTransaction(
          opportunity.tokenIn,
          opportunity.tokenOut,
          opportunity.amountIn,
          profitAfterSlippage
        ) :
        await this.avnu.buildSwapTransaction(
          opportunity.tokenIn,
          opportunity.tokenOut,
          opportunity.amountIn,
          profitAfterSlippage
        );

      const sellCall = opportunity.sellDex === 'Ekubo' ?
        await this.ekubo.buildSwapTransaction(
          opportunity.tokenOut,
          opportunity.tokenIn,
          profitAfterSlippage,
          opportunity.amountIn
        ) :
        await this.avnu.buildSwapTransaction(
          opportunity.tokenOut,
          opportunity.tokenIn,
          profitAfterSlippage,
          opportunity.amountIn
        );

      // 使用 Avnu 的 gasless-sdk 执行交易
      const response = await executeCalls(
        this.account,
        [buyCall, sellCall],
        {
          gasTokenAddress: opportunity.tokenIn, // 使用输入代币作为 gas 代币
          maxGasTokenAmount: opportunity.estimatedGas * 2n // 添加 100% 的缓冲
        },
        {
          baseUrl: process.env.AVNU_API_BASE_URL,
          apiKey: process.env.AVNU_API_KEY,
          apiPublicKey: process.env.AVNU_API_PUBLIC_KEY
        }
      );

      return response.transactionHash;
    } catch (error) {
      console.error('Error executing arbitrage:', error);
      return null;
    }
  }

  async checkAndExecuteArbitrage(opportunity: ArbitrageOpportunity): Promise<boolean> {
    try {
      // 检查账户余额
      const balance = await this.provider.getBalance({
        contractAddress: opportunity.tokenIn,
        ownerAddress: this.account.address
      });

      if (balance.balance < opportunity.amountIn) {
        console.log('Insufficient balance');
        return false;
      }

      // 检查代币授权
      const allowanceEkubo = await this.ekubo.checkAllowance(
        opportunity.tokenIn,
        this.account.address
      );
      const allowanceAvnu = await this.avnu.checkAllowance(
        opportunity.tokenIn,
        this.account.address
      );

      // 如果需要，执行授权
      if (allowanceEkubo < opportunity.amountIn) {
        await this.ekubo.approve(opportunity.tokenIn, opportunity.amountIn);
      }
      if (allowanceAvnu < opportunity.amountIn) {
        await this.avnu.approve(opportunity.tokenIn, opportunity.amountIn);
      }

      // 执行套利
      const txHash = await this.executeArbitrage(opportunity);
      if (!txHash) {
        return false;
      }

      console.log('Arbitrage executed successfully:', txHash);
      return true;
    } catch (error) {
      console.error('Error in checkAndExecuteArbitrage:', error);
      return false;
    }
  }
}
