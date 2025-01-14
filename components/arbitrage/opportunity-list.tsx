import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArbitrageOpportunity } from '@/lib/services/price-monitor';
import { formatEther, formatUnits } from 'viem';

interface OpportunityListProps {
  opportunities: ArbitrageOpportunity[];
  onExecute: (opportunity: ArbitrageOpportunity) => Promise<void>;
  isExecuting: boolean;
}

export function OpportunityList({
  opportunities,
  onExecute,
  isExecuting
}: OpportunityListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>买入 DEX</TableHead>
            <TableHead>卖出 DEX</TableHead>
            <TableHead>代币对</TableHead>
            <TableHead className="text-right">数量</TableHead>
            <TableHead className="text-right">预期收益</TableHead>
            <TableHead className="text-right">收益率</TableHead>
            <TableHead className="text-right">Gas 费用</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.map((opportunity, index) => (
            <TableRow key={index}>
              <TableCell>{opportunity.buyDex}</TableCell>
              <TableCell>{opportunity.sellDex}</TableCell>
              <TableCell>{`${opportunity.tokenIn}/${opportunity.tokenOut}`}</TableCell>
              <TableCell className="text-right">
                {formatEther(opportunity.amountIn)}
              </TableCell>
              <TableCell className="text-right">
                {formatUnits(opportunity.expectedProfit, 18)}
              </TableCell>
              <TableCell className="text-right">
                {opportunity.profitPercentage.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right">
                {formatEther(opportunity.estimatedGas)}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => onExecute(opportunity)}
                  disabled={isExecuting}
                >
                  {isExecuting ? '执行中...' : '执行'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {opportunities.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                暂无套利机会
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
