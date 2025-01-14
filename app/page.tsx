"use client"

import { DashboardShell } from '@/components/dashboard/shell';
import { MainNav } from '@/components/dashboard/main-nav';
import { Overview } from '@/components/dashboard/overview';
import { RecentTrades } from '@/components/dashboard/recent-trades';
import { MarketOpportunities } from '@/components/dashboard/market-opportunities';

export default function Home() {
  return (
    <DashboardShell>
      <MainNav />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">StarkArb</h2>
          <p className="text-muted-foreground">
            跨协议套利系统
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Overview />
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <MarketOpportunities className="col-span-4" />
          <RecentTrades className="col-span-3" />
        </div>
      </div>
    </DashboardShell>
  );
}