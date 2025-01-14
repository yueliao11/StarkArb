import { ArbitrageOpportunity } from "@/lib/dex/types"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

interface OpportunityListProps {
  opportunities: ArbitrageOpportunity[]
  onExecute: (opportunity: ArbitrageOpportunity) => void
  isExecuting: boolean
}

export function OpportunityList({ opportunities, onExecute, isExecuting }: OpportunityListProps) {
  return (
    <div className="space-y-4">
      {opportunities.map((opportunity, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-card rounded-lg border">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <span className="font-medium">{opportunity.pair}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{opportunity.buyDex} → {opportunity.sellDex}</span>
              </div>
            </div>
            
            <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">价格差</div>
                <div className="font-medium text-green-500">+{opportunity.profitPercentage.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">预期收益</div>
                <div className="font-medium">${opportunity.profitUSD.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Gas成本</div>
                <div className="font-medium">${opportunity.estimatedGas.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">更新时间</div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(opportunity.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            className="ml-4"
            onClick={() => onExecute(opportunity)}
            disabled={isExecuting}
          >
            执行套利
          </Button>
        </div>
      ))}

      {opportunities.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          暂无套利机会
        </div>
      )}
    </div>
  )
} 