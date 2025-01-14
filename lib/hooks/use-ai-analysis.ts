"use client"

import { useState } from 'react'
import { ArbitrageOpportunity } from './use-arbitrage'
import { toast } from '@/components/ui/use-toast'

export function useAIAnalysis() {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string>('')

  const analyzeOpportunity = async (opportunity: ArbitrageOpportunity) => {
    try {
      setAnalyzing(true)
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opportunity }),
      })

      if (!response.ok) {
        throw new Error('Analysis request failed')
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setAnalysis(data.analysis)
      return data.analysis

    } catch (err) {
      const error = err instanceof Error ? err : new Error('分析失败')
      toast({
        title: "分析失败",
        description: error.message,
        variant: "destructive"
      })
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