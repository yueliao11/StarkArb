import { Account } from 'starknet';
import { ekuboApi } from '../api/ekubo';
import { avnuApi } from '../api/avnu';
import { toast } from '@/components/ui/use-toast';
import { EventEmitter } from 'events';

export interface TransactionStatus {
  hash: string;
  status: 'PENDING' | 'ACCEPTED_ON_L2' | 'REJECTED';
  error?: string;
}

class TransactionService extends EventEmitter {
  private pendingTransactions: Map<string, TransactionStatus>;
  private pollingInterval: NodeJS.Timeout | null;

  constructor() {
    super();
    this.pendingTransactions = new Map();
    this.pollingInterval = null;
  }

  // 开始追踪交易状态
  startTracking(hash: string, initialStatus: TransactionStatus['status'] = 'PENDING') {
    this.pendingTransactions.set(hash, {
      hash,
      status: initialStatus
    });

    if (!this.pollingInterval) {
      this.startPolling();
    }

    return () => this.stopTracking(hash);
  }

  // 停止追踪指定交易
  stopTracking(hash: string) {
    this.pendingTransactions.delete(hash);
    if (this.pendingTransactions.size === 0 && this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // 轮询交易状态
  private startPolling() {
    this.pollingInterval = setInterval(async () => {
      for (const [hash, status] of this.pendingTransactions) {
        try {
          const updatedStatus = await avnuApi.getTransactionStatus(hash);
          
          if (updatedStatus.status !== status.status) {
            this.pendingTransactions.set(hash, {
              hash,
              status: updatedStatus.status,
              error: updatedStatus.error
            });

            this.emit('statusChange', {
              hash,
              status: updatedStatus.status,
              error: updatedStatus.error
            });

            if (updatedStatus.status === 'ACCEPTED_ON_L2' || updatedStatus.status === 'REJECTED') {
              this.stopTracking(hash);
            }
          }
        } catch (error) {
          console.error(`Error polling transaction ${hash}:`, error);
        }
      }
    }, 5000); // 每5秒轮询一次
  }

  // 执行套利交易
  async executeArbitrage(params: {
    account: Account;
    tokenIn: string;
    tokenOut: string;
    amount: string;
    dexRoute: 'EKUBO_TO_AVNU' | 'AVNU_TO_EKUBO';
  }) {
    try {
      const { account, tokenIn, tokenOut, amount, dexRoute } = params;

      // 获取交易报价
      const quote = await (dexRoute === 'EKUBO_TO_AVNU' 
        ? ekuboApi.getQuote(tokenIn, tokenOut, BigInt(amount))
        : avnuApi.getQuote({ tokenIn, tokenOut, amount }));

      // 构建交易
      const transaction = await (dexRoute === 'EKUBO_TO_AVNU'
        ? ekuboApi.buildSwapTransaction(tokenIn, tokenOut, BigInt(amount), quote.amountOut)
        : avnuApi.buildSwapTransaction({
            tokenIn,
            tokenOut,
            amount,
            recipient: account.address,
            slippage: 0.5 // 0.5% 滑点
          }));

      // 获取 gas token 价格用于估算 gas 费用
      const gasTokens = await avnuApi.getGasTokenPrices();
      const ethPrice = gasTokens.find(token => token.symbol === 'ETH')?.priceUSD || 0;

      // 构建签名数据
      const typedData = await avnuApi.buildTypedData({
        userAddress: account.address,
        calls: [transaction],
        gasTokenAddress: gasTokens[0]?.tokenAddress,
        maxGasTokenAmount: '0.01' // 最大 gas 费用 0.01 ETH
      });

      // 签名交易
      const signature = await account.signMessage(typedData);

      // 发送交易
      const result = await avnuApi.executeTransaction({
        userAddress: account.address,
        typedData: JSON.stringify(typedData),
        signature: signature
      });

      // 开始追踪交易状态
      this.startTracking(result.transactionHash);

      toast({
        title: '交易已发送',
        description: `交易哈希: ${result.transactionHash}`
      });

      return result;
    } catch (error) {
      console.error('Error executing arbitrage:', error);
      toast({
        title: '交易失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
      throw error;
    }
  }

  // 检查交易是否完成
  isTransactionComplete(hash: string) {
    const status = this.pendingTransactions.get(hash);
    return !status || status.status === 'ACCEPTED_ON_L2' || status.status === 'REJECTED';
  }

  // 获取交易状态
  getTransactionStatus(hash: string) {
    return this.pendingTransactions.get(hash);
  }
}

export const transactionService = new TransactionService();
