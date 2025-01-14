"use client"

import { useEffect, useState } from 'react'
import { usePriceMonitor } from '@/lib/services/price-monitor'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface StatusBannerProps {
  className?: string
}

export function StatusBanner({ className }: StatusBannerProps) {
  const { statusMessages, isLoading } = usePriceMonitor()
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    if (statusMessages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => 
          prev === statusMessages.length - 1 ? 0 : prev + 1
        )
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [statusMessages.length])

  const currentMessage = statusMessages[currentMessageIndex]

  if (!currentMessage) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center p-2 text-sm rounded-lg",
        currentMessage.type === "success" && "bg-green-50 text-green-700",
        currentMessage.type === "warning" && "bg-yellow-50 text-yellow-700",
        currentMessage.type === "error" && "bg-red-50 text-red-700",
        currentMessage.type === "info" && "bg-blue-50 text-blue-700",
        className
      )}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      <span>{currentMessage.text}</span>
      {statusMessages.length > 1 && (
        <span className="ml-2 text-xs opacity-50">
          {currentMessageIndex + 1}/{statusMessages.length}
        </span>
      )}
    </div>
  )
}
