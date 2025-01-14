"use client"

import { useState } from 'react'
import { ArbitrageOpportunity } from './use-arbitrage'
import { toast } from '@/components/ui/use-toast'

// 序列化任意值，处理 BigInt
function serializeValue(value: any): any {
  if (typeof value === 'bigint') {
    return value.toString()
  }
  
  if (Array.isArray(value)) {
    return value.map(serializeValue)
  }
  
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serializeValue(v)])
    )
  }
  
  return value
}

// 序列化机会对象
function serializeOpportunity(opportunity: ArbitrageOpportunity) {
  return serializeValue(opportunity)
}

export function useAIAnalysis() {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string>('')

  const analyzeOpportunity = async (opportunity: ArbitrageOpportunity): Promise<boolean> => {
    try {
      console.log('Starting analysis with opportunity:', opportunity)
      setAnalyzing(true)
      
      // 序列化机会对象
      const serializedOpportunity = serializeOpportunity(opportunity)
      console.log('Serialized opportunity:', serializedOpportunity)
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opportunity: serializedOpportunity }),
      })

      console.log('API response status:', response.status)
      const data = await response.json()
      console.log('API response data:', data)

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis request failed')
      }

      if (!data.analysis) {
        throw new Error('No analysis received')
      }

      setAnalysis(data.analysis)
      return true

    } catch (err) {
      console.error('Analysis error:', err)
      const error = err instanceof Error ? err : new Error('分析失败')
      toast({
        title: "分析失败",
        description: error.message,
        variant: "destructive"
      })
      return false
    } finally {
      setAnalyzing(false)
    }
  }

  return {
    analyzeOpportunity,
    analyzing,
    analysis
  }
}