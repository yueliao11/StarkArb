"use client"

import { DashboardShell } from '@/components/dashboard/shell';
import { MainNav } from '@/components/dashboard/main-nav';
import { PriceChart } from '@/components/analysis/price-chart';
import { TradingPairAnalysis } from '@/components/analysis/trading-pair-analysis';
import { ProfitAnalysis } from '@/components/analysis/profit-analysis';

export default function AnalysisPage() {
  return (
    <DashboardShell>
      <MainNav />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">交易分析</h2>
        </div>
        
        <div className="grid gap-4">
          <PriceChart className="h-[400px]" />
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <TradingPairAnalysis />
          <ProfitAnalysis />
        </div>
      </div>
    </DashboardShell>
  );
}