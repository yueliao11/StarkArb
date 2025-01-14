"use client"

import { Button } from "@/components/ui/button"
import { connect, disconnect } from "get-starknet"
import { Loader2, Wallet, LogOut, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { getLastConnectedWallet } from "get-starknet-core"
import { AccountInterface } from "starknet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"

export function ConnectButton() {
  const [loading, setLoading] = useState(false)
  const [account, setAccount] = useState<AccountInterface | null>(null)

  useEffect(() => {
    async function init() {
      const lastWallet = await getLastConnectedWallet()
      if (lastWallet?.isConnected) {
        setAccount(lastWallet.account)
      }
    }
    init()
  }, [])

  const handleConnect = async () => {
    try {
      setLoading(true)
      const starknet = await connect()
      if (starknet?.account) {
        setAccount(starknet.account)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect({ clearLastWallet: true })
      setAccount(null)
    } catch (error) {
      console.error(error)
    }
  }

  if (account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <Wallet className="h-4 w-4" />
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>钱包信息</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-2">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">地址</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </span>
                    <a
                      href={`https://testnet.starkscan.co/contract/${account.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect} className="text-red-500 focus:text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            断开连接
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button 
      variant="outline"
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="h-4 w-4" />
      )}
      连接钱包
    </Button>
  )
}