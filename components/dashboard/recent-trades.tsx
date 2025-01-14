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

interface RecentTradesProps {
  className?: string
}

export function RecentTrades({ className }: RecentTradesProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Pair</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>12:45:30</TableCell>
              <TableCell>ETH/USDT</TableCell>
              <TableCell>Buy</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>12:44:15</TableCell>
              <TableCell>BTC/USDT</TableCell>
              <TableCell>Sell</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>12:42:00</TableCell>
              <TableCell>STARK/USDT</TableCell>
              <TableCell>Buy</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}