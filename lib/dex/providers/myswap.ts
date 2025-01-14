import { BaseDexProvider } from './base'
import { DexPrice } from '../types'

export class MySwapProvider extends BaseDexProvider {
  constructor() {
    super(
      'MySwap',
      'wss://api.myswap.xyz/ws/v1',
      'https://api.myswap.xyz/v1'
    )
  }

  async getPrice(pair: string): Promise<DexPrice> {
    try {
      const response = await fetch(`${this.apiUrl}/price/${pair}`)
      const data = await response.json()
      
      return {
        dexName: this.name,
        tokenPair: pair,
        price: parseFloat(data.price),
        timestamp: Date.now()
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getHistoricalPrices(pair: string, from: number, to: number): Promise<DexPrice[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/history/${pair}?from=${from}&to=${to}`
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
}

export const mySwapProvider = new MySwapProvider() 