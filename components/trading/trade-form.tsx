"use client"

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useTrade } from '@/lib/hooks/use-trade';
import { Loader2 } from 'lucide-react';

export function TradeForm() {
  const [fromToken, setFromToken] = React.useState('');
  const [toToken, setToToken] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [slippage, setSlippage] = React.useState(0.5);
  const { executeTrade, loading, status } = useTrade();

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await executeTrade({
      fromToken,
      toToken,
      amount,
      slippage
    }, '0x123...'); // TODO: 从钱包获取地址
  }, [executeTrade, fromToken, toToken, amount, slippage]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>交易</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromToken">支付代币</Label>
            <Input
              id="fromToken"
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              placeholder="代币地址"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="toToken">接收代币</Label>
            <Input
              id="toToken"
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              placeholder="代币地址"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">数量</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>滑点 ({slippage}%)</Label>
            <Slider
              value={[slippage]}
              onValueChange={(value) => setSlippage(value[0])}
              max={5}
              step={0.1}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                交易处理中
              </>
            ) : (
              '确认交易'
            )}
          </Button>

          {status && (
            <div className={`text-sm ${
              status.status === 'success' ? 'text-green-500' :
              status.status === 'failed' ? 'text-red-500' :
              'text-yellow-500'
            }`}>
              {status.status === 'success' && `交易成功: ${status.hash}`}
              {status.status === 'failed' && `交易失败: ${status.error}`}
              {status.status === 'pending' && '交易确认中...'}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}