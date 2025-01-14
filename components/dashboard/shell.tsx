"use client"

import * as React from 'react'
import { ConnectButton } from "@/components/wallet/connect-button"

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* 左侧导航 */}
      <div className="w-[200px] flex-shrink-0">
        {children[0]} {/* MainNav */}
      </div>
      
      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex-1" />
            <ConnectButton />
          </div>
        </div>
        
        {/* 主内容 */}
        <div className="flex-1">
          {children[1]} {/* Page Content */}
        </div>
      </div>
    </div>
  );
}