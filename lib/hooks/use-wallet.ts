"use client"

import { useState, useEffect } from 'react'
import { 
  connect,
  disconnect,
  getAvailableWallets,
  getLastConnectedWallet,
  enable
} from "get-starknet-core"
import { AccountInterface, StarknetWindowObject } from "starknet"
import { create } from "zustand"
import { toast } from "@/components/ui/use-toast"

interface WalletState {
  account: AccountInterface | null
  availableWallets: StarknetWindowObject[]
  connecting: boolean
  setAccount: (account: AccountInterface | null) => void
  setAvailableWallets: (wallets: StarknetWindowObject[]) => void
  setConnecting: (connecting: boolean) => void
}

export const useWalletStore = create<WalletState>((set) => ({
  account: null,
  availableWallets: [],
  connecting: false,
  setAccount: (account) => set({ account }),
  setAvailableWallets: (wallets) => set({ availableWallets: wallets }),
  setConnecting: (connecting) => set({ connecting })
}))

export function useWallet() {
  const { 
    account,
    availableWallets,
    connecting,
    setAccount,
    setAvailableWallets,
    setConnecting
  } = useWalletStore()

  useEffect(() => {
    async function init() {
      try {
        const lastWallet = await getLastConnectedWallet()
        if (lastWallet?.isConnected) {
          setAccount(lastWallet.account)
        }

        const wallets = await getAvailableWallets()
        setAvailableWallets(wallets)
      } catch (error) {
        console.error('Failed to initialize wallet:', error)
      }
    }
    init()
  }, [])

  const connectWallet = async (wallet?: StarknetWindowObject) => {
    try {
      setConnecting(true)
      if (wallet) {
        const starknet = await enable(wallet)
        setAccount(starknet.account)
      } else {
        const starknet = await connect()
        if (!starknet?.account) {
          throw new Error("Failed to connect wallet")
        }
        setAccount(starknet.account)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast({
        title: "连接失败",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive"
      })
    } finally {
      setConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await disconnect({ clearLastWallet: true })
      setAccount(null)
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      toast({
        title: "断开连接失败",
        description: error instanceof Error ? error.message : "Failed to disconnect wallet", 
        variant: "destructive"
      })
    }
  }

  return {
    account,
    availableWallets,
    connecting,
    connectWallet,
    disconnectWallet
  }
}