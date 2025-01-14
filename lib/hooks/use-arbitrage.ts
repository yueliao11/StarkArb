"use client"

import { useState, useEffect } from 'react'
import { dexProviders } from '../dex/providers'
import { ArbitrageOpportunity, DexPrice } from '../dex/types'
import { ekubo } from '../api/ekubo'

// 模拟DEX价格数据
const mockDexPrices = {
  ekubo: {
    ETH: 3475.50,
    BTC: 65900.25,
    STARK: 4.35
  },
  jediswap: {
    ETH: 3470.80,
    BTC: 65850.75,
    STARK: 4.32
  },
  myswap: {
    ETH: 3480.20,
    BTC: 65920.50,
    STARK: 4.38
  },
  avnu: {
    ETH: 3473.90,
    BTC: 65880.30,
    STARK: 4.34
  }
}

// 生成模拟套利机会
function generateMockArbitrage(): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = []
  const dexes = Object.keys(mockDexPrices)
  const tokens = ['ETH', 'BTC', 'STARK']
  
  for(let i = 0; i < 20; i++) {
    const buyDex = dexes[Math.floor(Math.random() * dexes.length)]
    let sellDex
    do {
      sellDex = dexes[Math.floor(Math.random() * dexes.length)]
    } while(sellDex === buyDex)
    
    const token = tokens[Math.floor(Math.random() * tokens.length)]
    const buyPrice = mockDexPrices[buyDex][token]
    const sellPrice = mockDexPrices[sellDex][token]
    
    if(sellPrice > buyPrice) {
      const priceGap = ((sellPrice - buyPrice) / buyPrice * 100)
      const amount = Math.random() * 10
      const profitUSD = (sellPrice - buyPrice) * amount
      const estimatedGas = Math.floor(Math.random() * 1000000)

      opportunities.push({
        token,
        tokenIn: token,
        tokenOut: 'USDC',
        buyDex,
        sellDex,
        buyPrice,
        sellPrice,
        priceGap,
        amount,
        pair: `${token}/USDC`,
        amountIn: BigInt(Math.floor(amount * 1e18)),
        profitUSD,
        estimatedGas,
        expectedProfit: profitUSD,
        profitPercentage: priceGap,
        timestamp: new Date().getTime()
      })
    }
  }
  
  return opportunities.sort((a, b) => b.profitUSD - a.profitUSD).slice(0, 20)
}

export function useArbitrage() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [scanningInfo, setScanningInfo] = useState<string[]>([])

  useEffect(() => {
    const tokens = [
      '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', // ETH
      '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac', // BTC 
      '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d'  // STARK
    ]

    const updatePrices = async () => {
      try {
        // 显示扫描过程
        const dexes = ['Ekubo', 'JediSwap', 'MySwap', 'Avnu']
        const tokenNames = ['ETH', 'BTC', 'STARK']
        
        for(const dex of dexes) {
          setScanningInfo(prev => [...prev, `正在获取 ${dex} 价格数据...`].slice(-5))
          for(const token of tokenNames) {
            setScanningInfo(prev => [...prev, `正在获取 ${dex} 的 ${token} 价格...`].slice(-5))
          }
          setScanningInfo(prev => [...prev, `完成获取 ${dex} 价格数据`].slice(-5))
        }

        setScanningInfo(prev => [...prev, '正在计算套利机会...'].slice(-5))
        
        // 生成模拟套利机会
        const mockOpportunities = generateMockArbitrage()
        setOpportunities(mockOpportunities)
        
        setScanningInfo(prev => [...prev, `发现 ${mockOpportunities.length} 个套利机会`].slice(-5))
        setLoading(false)
      } catch (error) {
        console.error('Error updating prices:', error)
        setScanningInfo(prev => [...prev, '获取价格失败,使用模拟数据...'].slice(-5))
      }
    }

    // 初始更新
    updatePrices()

    // 每3秒更新一次
    const timer = setInterval(updatePrices, 3000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return {
    opportunities,
    loading,
    scanningInfo,
    executeArbitrage: async () => {
      // 执行套利逻辑
    }
  }
}