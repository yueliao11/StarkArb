import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Info, Loader2 } from "lucide-react"
import { ArbitrageOpportunity, usePriceMonitor } from "@/lib/services/price-monitor"
import { formatEther, formatUnits } from "viem"
import { StatusBanner } from "./status-banner"
import { Skeleton } from "@/components/ui/skeleton"

interface OpportunityListProps {
  onExecute: (opportunity: ArbitrageOpportunity) => Promise<void>
  isExecuting: boolean
}

export function OpportunityList({
  onExecute,
  isExecuting,
}: OpportunityListProps) {
  const { opportunities, statusMessages, isLoading } = usePriceMonitor()

  return (
    <div className="space-y-4">
      <StatusBanner messages={statusMessages} className="min-h-[40px]" />
      
      <div className="space-y-4">
        {isLoading ? (
          // 加载状态显示骨架屏
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 space-y-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-full mt-2" />
            </div>
          ))
        ) : opportunities.length === 0 ? (
          // 无数据状态
          <div className="flex items-center justify-center p-8 text-sm text-muted-foreground border rounded-lg">
            <Info className="w-4 h-4 mr-2" />
            暂无套利机会
          </div>
        ) : (
          // 显示套利机会列表
          opportunities.map((opportunity) => (
            <div key={opportunity.hash} className="p-4 space-y-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">{opportunity.tokenIn}/USDC</span>
                <span className="text-sm text-muted-foreground">
                  {`${opportunity.buyDex} → ${opportunity.sellDex}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">预期收益</span>
                <span className="font-medium text-green-600">
                  ${formatUnits(opportunity.expectedProfit, 6)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">价格差</span>
                <span className="text-sm">
                  +{opportunity.profitPercentage.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gas成本</span>
                <span className="text-sm">
                  ${formatEther(opportunity.estimatedGas)}
                </span>
              </div>
              <Button
                className="w-full mt-2"
                size="sm"
                variant="outline"
                onClick={() => onExecute(opportunity)}
                disabled={isExecuting}
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    执行中...
                  </>
                ) : (
                  "执行套利"
                )}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
