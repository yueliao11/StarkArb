import { BaseDexProvider } from './base'
import { DexPrice } from '../types'

export class JediSwapProvider extends BaseDexProvider {
  constructor() {
    super(
      'JediSwap',
      'wss://api.jediswap.xyz/ws/v1',
      'https://api.jediswap.xyz/v1'
    )
  }

  async getPrice(pair: string): Promise<DexPrice> {
    try {
      const response = await fetch(`${this.apiUrl}/pairs/${pair}`)
      const data = await response.json()
      
      return {
        dexName: this.name,
        tokenPair: pair,
        price: this.calculatePrice(data.reserve0, data.reserve1),
        timestamp: Date.now()
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getHistoricalPrices(pair: string, from: number, to: number): Promise<DexPrice[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/pairs/${pair}/history?from=${from}&to=${to}`
      )
      const data = await response.json()
      
      return data.prices.map((p: any) => ({
        dexName: this.name,
        tokenPair: pair,
        price: parseFloat(p.price),
        timestamp: p.timestamp
      }))
    } catch (error) {
      return this.handleError(error)
    }
  }

  private calculatePrice(reserve0: string, reserve1: string): number {
    return parseFloat(reserve1) / parseFloat(reserve0)
  }
}

export const jediSwapProvider = new JediSwapProvider() 