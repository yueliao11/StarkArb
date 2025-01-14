import { useArbitrage } from '@/lib/hooks/use-arbitrage'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function OpportunityTable() {
  const { opportunities, loading } = useArbitrage()

  if (loading) {
    return <Loader2 className="h-8 w-8 animate-spin" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th>交易对</th>
            <th>买入/卖出</th>
            <th>价格差</th>
            <th>预期收益</th>
            <th>Gas成本</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp, index) => (
            <tr key={index}>
              <td>{opp.pair}</td>
              <td>{opp.buyDex} → {opp.sellDex}</td>
              <td className="text-green-500">+{opp.spread.toFixed(2)}%</td>
              <td>${opp.expectedProfit.toFixed(2)}</td>
              <td>${opp.gasEstimate.toFixed(2)}</td>
              <td>
                <Button variant="outline">执行套利</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 