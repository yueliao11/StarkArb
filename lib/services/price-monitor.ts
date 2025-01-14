import { Provider } from 'starknet';
import { EkuboDex } from '../dex/ekubo';
import { AvnuDex } from '../dex/avnu';
import { TESTNET } from '../config/contracts';
import { ARBITRAGE_CONFIG } from '../config/arbitrage';
import EventEmitter from 'events';

export interface ArbitrageOpportunity {
  buyDex: string;
  sellDex: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  expectedProfit: bigint;
  profitPercentage: number;
  estimatedGas: bigint;
}

export class PriceMonitor extends EventEmitter {
  private readonly ekubo: EkuboDex;
  private readonly avnu: AvnuDex;
  private readonly provider: Provider;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(provider: Provider) {
    super();
    this.provider = provider;
    this.ekubo = new EkuboDex(undefined, provider);
    this.avnu = new AvnuDex(undefined, provider);
  }

  async checkArbitrageOpportunity(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint
  ): Promise<ArbitrageOpportunity | null> {
    try {
      // 获取两个 DEX 的价格
      const [ekuboPrice, avnuPrice] = await Promise.all([
        this.ekubo.getPrice(tokenIn, tokenOut, amountIn),
        this.avnu.getPrice(tokenIn, tokenOut, amountIn)
      ]);

      if (!ekuboPrice || !avnuPrice) return null;

      // 计算价格差异
      const ekuboAmount = BigInt(Math.floor(Number(amountIn) * Number(ekuboPrice.price)));
      const avnuAmount = BigInt(Math.floor(Number(amountIn) * Number(avnuPrice.price)));

      // 确定买入和卖出的 DEX
      let buyDex: string, sellDex: string, profit: bigint;
      if (ekuboAmount > avnuAmount) {
        buyDex = 'Avnu';
        sellDex = 'Ekubo';
        profit = ekuboAmount - avnuAmount;
      } else {
        buyDex = 'Ekubo';
        sellDex = 'Avnu';
        profit = avnuAmount - ekuboAmount;
      }

      // 计算利润百分比
      const profitPercentage = (Number(profit) / Number(amountIn)) * 100;

      // 检查是否达到最小利润阈值
      if (profitPercentage < ARBITRAGE_CONFIG.MIN_PROFIT_THRESHOLD) {
        return null;
      }

      // 估算 Gas 费用
      const [buyGas, sellGas] = await Promise.all([
        buyDex === 'Ekubo' ? this.ekubo.estimateGas(tokenIn, tokenOut, amountIn) : this.avnu.estimateGas(tokenIn, tokenOut, amountIn),
        sellDex === 'Ekubo' ? this.ekubo.estimateGas(tokenOut, tokenIn, BigInt(Math.floor(Number(amountIn) * Number(ekuboPrice.price)))) : this.avnu.estimateGas(tokenOut, tokenIn, BigInt(Math.floor(Number(amountIn) * Number(avnuPrice.price))))
      ]);

      const totalGas = buyGas + sellGas;

      return {
        buyDex,
        sellDex,
        tokenIn,
        tokenOut,
        amountIn,
        expectedProfit: profit,
        profitPercentage,
        estimatedGas: totalGas
      };
    } catch (error) {
      console.error('Error checking arbitrage opportunity:', error);
      return null;
    }
  }

  startMonitoring(
    tokenPairs: Array<{ tokenIn: string; tokenOut: string; amountIn: bigint }>,
    interval: number = ARBITRAGE_CONFIG.PRICE_UPDATE_INTERVAL
  ) {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      for (const pair of tokenPairs) {
        const opportunity = await this.checkArbitrageOpportunity(
          pair.tokenIn,
          pair.tokenOut,
          pair.amountIn
        );

        if (opportunity) {
          this.emit('opportunity', opportunity);
        }
      }
    }, interval);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}
