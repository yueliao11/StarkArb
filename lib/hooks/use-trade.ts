"use client"

import * as React from 'react';
import { avnuApi } from '../api/avnu';
import { toast } from '@/components/ui/use-toast';

export interface TradeParams {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage: number;
}

export interface TradeStatus {
  status: 'pending' | 'success' | 'failed';
  hash?: string;
  error?: string;
}

export function useTrade() {
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<TradeStatus | null>(null);

  const executeTrade = React.useCallback(async (params: TradeParams, userAddress: string) => {
    try {
      setLoading(true);
      setStatus({ status: 'pending' });

      // 构建交易调用
      const calls = [{
        contractAddress: params.fromToken,
        entrypoint: 'approve',
        calldata: [params.amount]
      }, {
        contractAddress: params.toToken,
        entrypoint: 'swap',
        calldata: [params.amount, params.slippage.toString()]
      }];

      // 获取 gas token 价格
      const gasTokens = await avnuApi.getGasTokenPrices();
      const gasToken = gasTokens[0]; // 使用第一个支持的 gas token

      // 构建 typed data
      const typedData = await avnuApi.buildTypedData({
        userAddress,
        calls,
        gasTokenAddress: gasToken.tokenAddress,
        maxGasTokenAmount: '1000000000000000000' // 1 token
      });

      // TODO: 调用钱包签名
      const signature = ['0x0']; // 临时模拟签名

      // 执行交易
      const result = await avnuApi.executeTransaction({
        userAddress,
        typedData: JSON.stringify(typedData),
        signature
      });

      setStatus({
        status: 'success',
        hash: result.transactionHash
      });

      toast({
        title: "交易发送成功",
        description: `交易哈希: ${result.transactionHash}`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '交易失败';
      setStatus({
        status: 'failed',
        error: errorMessage
      });
      
      toast({
        title: "交易失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    executeTrade,
    loading,
    status
  };
}