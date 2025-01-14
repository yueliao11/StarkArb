import { useState } from 'react'
import { ArbitrageOpportunity } from '@/lib/dex/types'

export function useAIAnalysis() {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState('')

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
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      return true

    } catch (error) {
      console.error('Analysis error:', error)
      return false
      
    } finally {
      setAnalyzing(false)
    }
  }

  return {
    analyzing,
    analysis,
    analyzeOpportunity
  }
} 