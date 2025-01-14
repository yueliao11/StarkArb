"use client"

import { DashboardShell } from '@/components/dashboard/shell'
import { MainNav } from '@/components/dashboard/main-nav'
import { TradeForm } from '@/components/trading/trade-form'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function TradesPage() {
  return (
    <DashboardShell>
      <MainNav />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">交易</h2>
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <TradeForm />
          
          <Card>
            <CardHeader>
              <CardTitle>最近交易</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>交易对</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* TODO: 集成实际交易历史数据 */}
                  <TableRow>
                    <TableCell>2024-01-20 14:30</TableCell>
                    <TableCell>ETH/USDT</TableCell>
                    <TableCell>1.5 ETH</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                        成功
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}