"use client"

import { useState, useEffect } from 'react';
import { ekuboApi } from '../api/ekubo';
import { avnuApi } from '../api/avnu';

export interface PriceData {
  tokenAddress: string;
  symbol: string;
  priceUSD: number;
  priceETH: number;
  volume24h: number;
}

export function usePriceData() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        // 获取 Ekubo 价格数据
        const [ekuboPools, gasTokens] = await Promise.all([
          ekuboApi.getPools(),
          avnuApi.getGasTokenPrices()
        ]);

        // 处理和合并价格数据
        const priceData: PriceData[] = ekuboPools.map((pool: any) => ({
          tokenAddress: pool.token,
          symbol: pool.symbol,
          priceUSD: pool.priceUSD,
          priceETH: pool.priceETH,
          volume24h: pool.volume24h
        }));

        setPrices(priceData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch prices'));
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error };
}