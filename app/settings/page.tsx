"use client"

import * as React from 'react';
import { DashboardShell } from '@/components/dashboard/shell';
import { MainNav } from '@/components/dashboard/main-nav';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const [autoTrade, setAutoTrade] = React.useState(false);
  const [maxGas, setMaxGas] = React.useState("0.005");
  const [minProfit, setMinProfit] = React.useState("10");

  const handleSave = React.useCallback(() => {
    toast({
      title: "设置已保存",
      description: "您的偏好设置已成功更新",
    });
  }, []);

  return (
    <DashboardShell>
      <MainNav />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">设置</h2>
        </div>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>交易设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自动交易</Label>
                  <p className="text-sm text-muted-foreground">
                    发现套利机会时自动执行交易
                  </p>
                </div>
                <Switch
                  checked={autoTrade}
                  onCheckedChange={setAutoTrade}
                />
              </div>
              
              <div className="space-y-2">
                <Label>最大 Gas (ETH)</Label>
                <Input
                  type="number"
                  value={maxGas}
                  onChange={(e) => setMaxGas(e.target.value)}
                  step="0.001"
                />
                <p className="text-sm text-muted-foreground">
                  单笔交易愿意支付的最大 Gas 费用
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>最小收益 (USD)</Label>
                <Input
                  type="number"
                  value={minProfit}
                  onChange={(e) => setMinProfit(e.target.value)}
                  step="1"
                />
                <p className="text-sm text-muted-foreground">
                  执行套利的最小预期收益
                </p>
              </div>

              <Button onClick={handleSave}>
                保存设置
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}