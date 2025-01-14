"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useArbitrage } from "@/lib/hooks/use-arbitrage"
import { useAIAnalysis } from "@/lib/hooks/use-ai-analysis"
import { Loader2, Brain } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { SimulateModal } from "@/components/arbitrage/SimulateModal"
import { toast } from "@/components/ui/use-toast"

interface MarketOpportunitiesProps {
  className?: string
}

export function MarketOpportunities({ className }: MarketOpportunitiesProps) {
  const { opportunities, loading, executeArbitrage, scanningInfo } = useArbitrage()
  const { analyzeOpportunity, analyzing, analysis } = useAIAnalysis()
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [currentScanInfo, setCurrentScanInfo] = useState("")
  const [selectedOpportunity, setSelectedOpportunity] = useState<typeof opportunities[0] | null>(null)
  const [showSimulate, setShowSimulate] = useState(false)
  const [analyzingOpportunityId, setAnalyzingOpportunityId] = useState<number | null>(null)

  // 走马灯效果
  useEffect(() => {
    if (scanningInfo.length === 0) return
    
    let index = 0
    const interval = setInterval(() => {
      setCurrentScanInfo(scanningInfo[index])
      index = (index + 1) % scanningInfo.length
    }, 800) // 每800ms切换一次

    return () => clearInterval(interval)
  }, [scanningInfo])

  const handleAnalyze = async (opportunity: typeof opportunities[0], index: number) => {
    if (analyzing) {
      console.log('Already analyzing, skipping...')
      return
    }
    
    try {
      console.log('Starting analysis for opportunity:', opportunity)
      console.log('Setting analyzingOpportunityId to:', index)
      setAnalyzingOpportunityId(index)
      
      console.log('Calling analyzeOpportunity...')
      const success = await analyzeOpportunity(opportunity)
      console.log('Analysis result:', success)
      
      if (success) {
        console.log('Analysis successful, setting opportunity and showing dialog')
        setSelectedOpportunity(opportunity)
        setShowAnalysis(true)
        
        // 验证状态是否正确设置
        console.log('Current state after success:', {
          selectedOpportunity: opportunity,
          showAnalysis: true,
          analyzing: false,
          analyzingOpportunityId: null
        })
      } else {
        console.log('Analysis returned false')
        toast({
          title: "分析未完成",
          description: "请稍后重试",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Analysis failed with error:', error)
      toast({
        title: "分析失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      })
    } finally {
      console.log('Resetting analyzingOpportunityId')
      setAnalyzingOpportunityId(null)
    }
  }

  const handleExecute = async (opportunity: typeof opportunities[0]) => {
    setSelectedOpportunity(opportunity)
    setShowSimulate(true)
  }

  const handleSimulateComplete = async () => {
    if (!selectedOpportunity) return
    
    try {
      const success = await executeArbitrage(selectedOpportunity)
      if (success) {
        toast({
          title: "执行成功",
          description: "套利交易已提交",
        })
      }
    } finally {
      setSelectedOpportunity(null)
    }
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle>套利机会</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 h-8 flex items-center justify-center bg-muted/50 rounded-md">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="overflow-hidden min-w-[300px]">
                  <div className="whitespace-nowrap text-center">
                    {currentScanInfo}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>交易对</TableHead>
                <TableHead>买入/卖出</TableHead>
                <TableHead>价格差</TableHead>
                <TableHead>预期收益</TableHead>
                <TableHead>Gas成本</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opp, index) => (
                <TableRow key={index}>
                  <TableCell>{opp.pair}</TableCell>
                  <TableCell>
                    {opp.buyDex} → {opp.sellDex}
                  </TableCell>
                  <TableCell className="text-green-500">
                    +{opp.priceGap.toFixed(2)}%
                  </TableCell>
                  <TableCell>${opp.profitUSD.toFixed(2)}</TableCell>
                  <TableCell>${(opp.estimatedGas * 0.00005).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleExecute(opp)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "执行套利"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnalyze(opp, index)}
                        disabled={analyzing}
                        title="AI分析"
                        className="gap-2"
                      >
                        {analyzingOpportunityId === index ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="h-4 w-4" />
                        )}
                        AI分析
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {opportunities.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center py-4 text-muted-foreground">
                      暂无套利机会
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SimulateModal
        open={showSimulate}
        onOpenChange={setShowSimulate}
        opportunity={selectedOpportunity}
        onComplete={handleSimulateComplete}
      />

      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>套利机会分析</DialogTitle>
            <DialogDescription>
              {selectedOpportunity ? (
                <div className="mt-2 text-sm text-muted-foreground">
                  <div>交易对：{selectedOpportunity.pair}</div>
                  <div>交易路径：{selectedOpportunity.buyDex} → {selectedOpportunity.sellDex}</div>
                  <div>价格差：+{selectedOpportunity.priceGap.toFixed(2)}%</div>
                  <div>预期收益：${selectedOpportunity.profitUSD.toFixed(2)}</div>
                </div>
              ) : (
                <div>加载中...</div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 whitespace-pre-wrap text-sm">
            {analysis || '正在生成分析结果...'}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                console.log('Closing analysis dialog')
                setShowAnalysis(false)
                setSelectedOpportunity(null)
              }}
            >
              关闭
            </Button>
            {selectedOpportunity && (
              <Button
                onClick={() => {
                  console.log('Executing arbitrage from analysis dialog')
                  setShowAnalysis(false)
                  setSelectedOpportunity(null)
                  handleExecute(selectedOpportunity)
                }}
              >
                执行套利
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}