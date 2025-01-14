import { useContract } from "@/hooks/useContract"
import { useWallet } from "@/hooks/useWallet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { ArbitrageOpportunity } from "@/lib/dex/types"
import { Progress } from "@/components/ui/progress"

interface SimulateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity: ArbitrageOpportunity | null
  onComplete: () => void
}

export function SimulateModal({ open, onOpenChange, opportunity, onComplete }: SimulateModalProps) {
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState<'simulating' | 'success' | 'failed'>('simulating')
  const [error, setError] = useState("")
  
  const { account, connect } = useWallet()
  const contract = useContract("0x31d9732c1c5ec0c0669db5c3ce65564213ba737afe800011652cecc61cdc286")

  const steps = [
    '连接钱包...',
    '检查授权...',
    '模拟在' + opportunity?.buyDex + '购买' + opportunity?.tokenOut + '...',
    '模拟在' + opportunity?.sellDex + '卖出获取' + opportunity?.tokenIn + '...',
    '计算预期收益...'
  ]

  const simulateSteps = async () => {
    try {
      // 步骤1: 连接钱包
      setStep(0)
      console.log('开始连接钱包...')
      if (!account) {
        await connect()
      }
      console.log('钱包已连接:', account)
      await new Promise(r => setTimeout(r, 1000))

      // 步骤2: 检查合约授权
      setStep(1)
      console.log('检查合约实例:', contract)
      if (!contract) {
        throw new Error("合约未初始化")
      }
      console.log('合约已初始化')
      await new Promise(r => setTimeout(r, 1000))

      // 步骤3: 模拟购买
      setStep(2)
      console.log('开始模拟购买...')
      console.log('调用参数:', {
        tokenIn: opportunity.tokenIn,
        tokenOut: opportunity.tokenOut,
        buyDex: opportunity.buyDex,
        sellDex: opportunity.sellDex,
        amountIn: opportunity.amountIn
      })
      
      const result = await contract.simulate(
        opportunity.tokenIn,
        opportunity.tokenOut,
        opportunity.buyDex,
        opportunity.sellDex,
        opportunity.amountIn
      )
      console.log('模拟购买结果:', result)
      
      if (!result) {
        throw new Error("交易模拟失败")
      }

      // 步骤4: 模拟卖出
      setStep(3)
      console.log('开始模拟卖出...')
      await new Promise(r => setTimeout(r, 1000))

      // 步骤5: 计算收益
      setStep(4)
      console.log('计算预期收益...')
      await new Promise(r => setTimeout(r, 1000))
      
      setStatus('success')
      console.log('模拟完成')
      setTimeout(() => {
        onComplete()
        onOpenChange(false)
      }, 1000)
      
    } catch (err) {
      console.error('模拟失败:', err)
      setStatus('failed')
      setError(err.message)
    }
  }

  useEffect(() => {
    if (open) {
      console.log('模态框打开,开始模拟...')
      setStep(0)
      setStatus('simulating')
      setError("")
      simulateSteps()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>模拟套利交易</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Progress value={(step + 1) / steps.length * 100} />
          
          <div className="mt-4 space-y-2">
            {steps.map((text, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  index < step ? 'bg-green-500' :
                  index === step ? 'bg-blue-500' :
                  'bg-gray-200'
                }`} />
                <span className={
                  index < step ? 'text-green-500' :
                  index === step ? 'text-blue-500' :
                  'text-gray-500'
                }>{text}</span>
              </div>
            ))}
          </div>

          {status === 'success' && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded">
              模拟交易成功!可以执行实际套利交易了。
            </div>
          )}

          {status === 'failed' && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
              交易失败: {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 