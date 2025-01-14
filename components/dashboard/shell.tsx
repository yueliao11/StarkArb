"use client"

import * as React from 'react'
import { ConnectButton } from "@/components/wallet/connect-button"
import { useWallet } from "@/lib/hooks/use-wallet"
import { usePriceMonitor } from '@/lib/services/price-monitor'

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { account } = useWallet()
  const { statusMessages, opportunities } = usePriceMonitor()

  return (
    <div className="flex min-h-screen bg-background">
      {/* 左侧导航 - 只在钱包连接后显示 */}
      {account && (
        <div className="w-[200px] flex-shrink-0">
          {children[0]} {/* MainNav */}
        </div>
      )}
      
      {/* 右侧主内容区 */}
      <div className={`flex-1 flex flex-col ${!account ? 'items-center justify-center' : ''}`}>
        {/* 顶部栏 */}
        <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex-1" />
            <ConnectButton />
          </div>
        </div>
        
        {/* 主内容区 */}
        <div className="flex-1 p-6">
          {account ? (
            <>
              {children[1]} {/* Page Content */}
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">欢迎使用 StarArb</h2>
              <p className="text-muted-foreground mt-2">
                请先连接您的钱包以开始使用套利功能
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}