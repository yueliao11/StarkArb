"use client"

import { useState, useEffect } from 'react'
import { 
  connect as connectWallet,
  disconnect as disconnectWallet,
  StarknetWindowObject,
  getStarknet,
} from "get-starknet"
import { AccountInterface, Contract, Provider, ProviderInterface, RpcProvider } from "starknet"
import { create } from "zustand"
import { toast } from "@/components/ui/use-toast"

// ERC20 代币 ABI
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "felt" }],
    outputs: [{ name: "balance", type: "Uint256" }],
    stateMutability: "view"
  }
] as const

interface WalletState {
  account: AccountInterface | null
  availableWallets: StarknetWindowObject[]
  connecting: boolean
  balances: {
    [key: string]: bigint
  }
  setAccount: (account: AccountInterface | null) => void
  setAvailableWallets: (wallets: StarknetWindowObject[]) => void
  setConnecting: (connecting: boolean) => void
  setBalance: (token: string, balance: bigint) => void
}

export const useWalletStore = create<WalletState>((set) => ({
  account: null,
  availableWallets: [],
  connecting: false,
  balances: {},
  setAccount: (account) => set({ account }),
  setAvailableWallets: (wallets) => set({ availableWallets: wallets }),
  setConnecting: (connecting) => set({ connecting }),
  setBalance: (token, balance) => set((state) => ({
    balances: { ...state.balances, [token]: balance }
  }))
}))

export function useWallet() {
  const { 
    account,
    availableWallets,
    connecting,
    balances,
    setAccount,
    setAvailableWallets,
    setConnecting,
    setBalance
  } = useWalletStore()

  // 获取代币余额
  const getTokenBalance = async (tokenAddress: string): Promise<bigint> => {
    if (!account) return BigInt(0)

    try {
      // 创建 Provider
      const provider = new RpcProvider({
        nodeUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://starknet-mainnet.public.blastapi.io'
      })

      // 创建合约实例
      const contract = new Contract(ERC20_ABI, tokenAddress, provider)

      // 调用 balanceOf 函数
      const { balance } = await contract.balanceOf(account.address)
      
      // 转换为 bigint
      return BigInt(balance.toString())
    } catch (error) {
      console.error('Failed to get token balance:', error)
      return BigInt(0)
    }
  }

  // 更新余额
  const updateBalances = async () => {
    if (!account) return

    try {
      // 获取 ETH 余额
      const ethBalance = await getTokenBalance(process.env.NEXT_PUBLIC_ETH_ADDRESS || '')
      setBalance('ETH', ethBalance)
    } catch (error) {
      console.error('Failed to update balances:', error)
    }
  }

  useEffect(() => {
    async function init() {
      try {
        // 获取 Starknet 对象
        const starknet = getStarknet()
        
        // 检查已安装的钱包
        const wallets = await starknet.getAvailableWallets()
        setAvailableWallets(wallets)

        // 检查是否已连接
        if (starknet.isConnected && starknet.account) {
          setAccount(starknet.account)
        }
      } catch (error) {
        console.error('Wallet initialization error:', error)
        toast({
          title: "钱包初始化失败",
          description: "请刷新页面重试",
          variant: "destructive"
        })
      }
    }
    init()
  }, [setAccount, setAvailableWallets])

  // 当账户变化时更新余额
  useEffect(() => {
    if (account) {
      updateBalances()
      
      // 每30秒更新一次余额
      const interval = setInterval(updateBalances, 30000)
      return () => clearInterval(interval)
    }
  }, [account])

  const connectWalletHandler = async () => {
    try {
      setConnecting(true)
      const starknet = await connectWallet()
      
      if (!starknet?.isConnected || !starknet.account) {
        throw new Error("连接失败")
      }

      setAccount(starknet.account)
      toast({
        title: "连接成功",
        description: "钱包已连接",
      })
    } catch (error) {
      console.error('Wallet connection error:', error)
      toast({
        title: "连接失败",
        description: "请检查钱包后重试",
        variant: "destructive"
      })
    } finally {
      setConnecting(false)
    }
  }

  const disconnectWalletHandler = async () => {
    try {
      await disconnectWallet()
      setAccount(null)
      toast({
        title: "断开连接",
        description: "钱包已断开连接",
      })
    } catch (error) {
      console.error('Wallet disconnect error:', error)
      toast({
        title: "断开连接失败",
        description: "请重试",
        variant: "destructive"
      })
    }
  }

  return {
    account,
    availableWallets,
    connecting,
    balances,
    connectWallet: connectWalletHandler,
    disconnectWallet: disconnectWalletHandler
  }
}