import { Provider } from 'starknet';
import { OpportunityList } from '@/components/arbitrage/opportunity-list';
import { useEffect, useState } from 'react';
import { PriceMonitor, ArbitrageOpportunity } from '@/lib/services/price-monitor';
import { ArbitrageExecutor } from '@/lib/services/arbitrage-executor';
import { useWallet } from '@/lib/hooks/use-wallet';
import { TESTNET } from '@/lib/config/contracts';
import { SimulateModal } from "@/components/arbitrage/SimulateModal"

export default function ArbitragePage() {
  const { account, provider } = useWallet();
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [monitor, setMonitor] = useState<PriceMonitor | null>(null);
  const [executor, setExecutor] = useState<ArbitrageExecutor | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ArbitrageOpportunity | null>(null)
  const [showSimulate, setShowSimulate] = useState(false)

  // 初始化监控器和执行器
  useEffect(() => {
    if (!provider || !account) return;

    const priceMonitor = new PriceMonitor(provider);
    const arbitrageExecutor = new ArbitrageExecutor(provider, account);

    setMonitor(priceMonitor);
    setExecutor(arbitrageExecutor);

    // 监听套利机会
    priceMonitor.on('opportunity', (opportunity: ArbitrageOpportunity) => {
      setOpportunities(prev => {
        // 移除旧的机会
        const filtered = prev.filter(op => 
          !(op.tokenIn === opportunity.tokenIn && 
            op.tokenOut === opportunity.tokenOut &&
            op.buyDex === opportunity.buyDex)
        );
        return [...filtered, opportunity];
      });
    });

    // 开始监控 ETH/USDC 交易对
    priceMonitor.startMonitoring([
      {
        tokenIn: TESTNET.TOKENS.ETH,
        tokenOut: TESTNET.TOKENS.USDC,
        amountIn: 1n * 10n ** 18n // 1 ETH
      }
    ]);

    return () => {
      priceMonitor.stopMonitoring();
      priceMonitor.removeAllListeners();
    };
  }, [provider, account]);

  // 执行套利
  const handleExecute = async (opportunity: ArbitrageOpportunity) => {
    setSelectedOpportunity(opportunity)
    setShowSimulate(true)
  }

  const handleSimulateComplete = async () => {
    if (!executor || !selectedOpportunity) return
    
    try {
      setIsExecuting(true)
      const success = await executor.checkAndExecuteArbitrage(selectedOpportunity)
      
      if (success) {
        setOpportunities(prev => 
          prev.filter(op => op !== selectedOpportunity)
        )
      }
    } finally {
      setIsExecuting(false)
      setSelectedOpportunity(null)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">套利机会</h1>
      <OpportunityList
        opportunities={opportunities}
        onExecute={handleExecute}
        isExecuting={isExecuting}
      />

      <SimulateModal
        open={showSimulate}
        onOpenChange={setShowSimulate}
        opportunity={selectedOpportunity}
        onComplete={handleSimulateComplete}
      />
    </div>
  );
}
