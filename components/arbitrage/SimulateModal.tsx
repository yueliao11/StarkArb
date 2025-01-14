import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"

interface SimulateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity: any
  onComplete: () => void
}

export function SimulateModal({ open, onOpenChange, opportunity, onComplete }: SimulateModalProps) {
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState<'simulating' | 'success' | 'failed'>('simulating')
  
  const steps = [
    '检查钱包余额...',
    '在' + opportunity?.buyDex + '购买' + opportunity?.tokenOut + '...',
    '在' + opportunity?.sellDex + '卖出获取' + opportunity?.tokenIn + '...',
    '计算预期收益...'
  ]

  useEffect(() => {
    if (open) {
      setStep(0)
      setStatus('simulating')
      simulateSteps()
    }
  }, [open])

  const simulateSteps = async () => {
    for (let i = 0; i < steps.length; i++) {
      setStep(i)
      await new Promise(r => setTimeout(r, 1000))
    }
    setStatus('success')
    setTimeout(() => {
      onComplete()
      onOpenChange(false)
    }, 1000)
  }

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
        </div>
      </DialogContent>
    </Dialog>
  )
}
