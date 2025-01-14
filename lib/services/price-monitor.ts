import { Provider } from 'starknet';
import { EkuboDex } from '../dex/ekubo';
import { AvnuDex } from '../dex/avnu';
import { TESTNET } from '../config/contracts';
import { ARBITRAGE_CONFIG } from '../config/arbitrage';
import EventEmitter from 'events';
import { create } from 'zustand'
import { StatusMessage } from '@/components/arbitrage/status-banner'

export interface ArbitrageOpportunity {
  tokenIn: string
  tokenOut: string
  buyDex: string
  sellDex: string
  amountIn: bigint
  expectedProfit: bigint
  profitPercentage: number
  estimatedGas: bigint
  hash?: string
}

interface PriceMonitorState {
  opportunities: ArbitrageOpportunity[]
  statusMessages: StatusMessage[]
  isMonitoring: boolean
  isLoading: boolean
  addOpportunity: (opportunity: ArbitrageOpportunity) => void
  removeOpportunity: (hash: string) => void
  addStatusMessage: (message: Omit<StatusMessage, 'id' | 'timestamp'>) => void
  clearStatusMessages: () => void
  setIsMonitoring: (isMonitoring: boolean) => void
  setLoading: (loading: boolean) => void
}

export const usePriceMonitor = create<PriceMonitorState>((set) => ({
  opportunities: [],
  statusMessages: [],
  isMonitoring: false,
  isLoading: false,
  addOpportunity: (opportunity) =>
    set((state) => ({
      opportunities: [...state.opportunities, opportunity],
    })),
  removeOpportunity: (hash) =>
    set((state) => ({
      opportunities: state.opportunities.filter((o) => o.hash !== hash),
    })),
  addStatusMessage: (message) =>
    set((state) => ({
      statusMessages: [
        ...state.statusMessages,
        {
          ...message,
          id: Math.random().toString(36).slice(2),
          timestamp: Date.now(),
        },
      ].slice(-10), // 只保留最新的10条消息
    })),
  clearStatusMessages: () =>
    set({
      statusMessages: [],
    }),
  setIsMonitoring: (isMonitoring) =>
    set({
      isMonitoring,
    }),
  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),
}))

// 检测状态消息队列
const monitoringSteps = [
  { text: '正在链接 Ekubo...', type: 'info' as const },
  { text: '正在链接 Myswap...', type: 'info' as const },
  { text: '正在链接 Avnu...', type: 'info' as const },
  { text: '正在检测 ETH/USDC 价格...', type: 'info' as const },
  { text: '正在检测 BTC/USDC 价格...', type: 'info' as const },
  { text: '正在检测 STARK/USDC 价格...', type: 'info' as const },
]

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
        tokenIn,
        tokenOut,
        buyDex,
        sellDex,
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

    const { setIsMonitoring, addStatusMessage, clearStatusMessages, setLoading } = usePriceMonitor.getState()
    
    setIsMonitoring(true)
    clearStatusMessages()
    setLoading(true)

    // 按顺序显示检测步骤
    monitoringSteps.forEach((step, index) => {
      setTimeout(() => {
        addStatusMessage(step)
      }, index * 1000)
    })

    this.monitoringInterval = setInterval(async () => {
      try {
        // 显示正在检测的状态
        setLoading(true)
        addStatusMessage({
          text: '正在检测套利机会...',
          type: 'info'
        })

        // 等待1秒来显示loading状态
        await new Promise(resolve => setTimeout(resolve, 1000))

        for (const pair of tokenPairs) {
          const opportunity = await this.checkArbitrageOpportunity(
            pair.tokenIn,
            pair.tokenOut,
            pair.amountIn
          );

          if (opportunity) {
            const { addOpportunity } = usePriceMonitor.getState()
            addOpportunity(opportunity)
            addStatusMessage({
              text: `发现新的套利机会！${opportunity.tokenIn}/${opportunity.tokenOut} +${opportunity.profitPercentage}%`,
              type: 'success',
            })
            this.emit('opportunity', opportunity);
          }
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch opportunities:', error)
        addStatusMessage({
          text: '检测套利机会失败',
          type: 'error'
        })
        setLoading(false)
      }
    }, interval);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    const { setIsMonitoring, clearStatusMessages, addStatusMessage, setLoading } = usePriceMonitor.getState()
    setIsMonitoring(false)
    clearStatusMessages()
    setLoading(false)
    addStatusMessage({
      text: '已停止检测',
      type: 'warning',
    })
  }
}
