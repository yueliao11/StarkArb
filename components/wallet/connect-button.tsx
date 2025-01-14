"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/hooks/use-wallet"
import { Wallet } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatEther } from "viem"

export function ConnectButton() {
  const { 
    account, 
    connecting, 
    balances,
    connectWallet, 
    disconnectWallet 
  } = useWallet()

  return (
    <div>
      {account ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Wallet className="w-4 h-4 mr-2" />
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            <DropdownMenuLabel>钱包余额</DropdownMenuLabel>
            <DropdownMenuItem className="flex justify-between cursor-default">
              <span>ETH</span>
              <span>{formatEther(balances['ETH'] || BigInt(0))} ETH</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                window.open(`https://starkscan.co/contract/${account.address}`, '_blank')
              }}
            >
              在 Starkscan 上查看
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={disconnectWallet}
              className="text-red-600 focus:text-red-600"
            >
              断开连接
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          onClick={connectWallet}
          disabled={connecting}
          size="sm"
        >
          {connecting ? "连接中..." : "连接钱包"}
        </Button>
      )}
    </div>
  )
}