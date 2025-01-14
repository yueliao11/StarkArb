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

export function TradingPairAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>交易对分析</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>交易对</TableHead>
              <TableHead>24h成交量</TableHead>
              <TableHead>平均价差</TableHead>
              <TableHead>套利次数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>ETH/USDT</TableCell>
              <TableCell>$5.2M</TableCell>
              <TableCell>0.82%</TableCell>
              <TableCell>24</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>BTC/USDT</TableCell>
              <TableCell>$12.4M</TableCell>
              <TableCell>0.45%</TableCell>
              <TableCell>18</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>STARK/USDT</TableCell>
              <TableCell>$1.8M</TableCell>
              <TableCell>1.24%</TableCell>
              <TableCell>32</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}