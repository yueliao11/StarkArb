import { BaseDexProvider } from './base'
import { DexPrice } from '../types'

export class EkuboProvider extends BaseDexProvider {
  constructor() {
    super(
      'Ekubo',
      'wss://api.ekubo.org/ws/v1',
      'https://api.ekubo.org/v1'
    )
  }

  async getPrice(pair: string): Promise<DexPrice> {
    try {
      const response = await fetch(`${this.apiUrl}/pairs/${pair}/price`)
      const data = await response.json()
      
      return {
        dexName: this.name,
        tokenPair: pair,
        price: this.formatPrice(data.price),
        timestamp: Date.now()
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getHistoricalPrices(pair: string, from: number, to: number): Promise<DexPrice[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/pairs/${pair}/prices?from=${from}&to=${to}`
      )
      const data = await response.json()
      
      return data.prices.map((p: any) => ({
        dexName: this.name,
        tokenPair: pair,
        price: this.formatPrice(p.price),
        timestamp: p.timestamp
      }))
    } catch (error) {
      return this.handleError(error)
    }
  }

  private formatPrice(price: string): number {
    return parseFloat(price) / (10 ** 18)
  }
}

export const ekuboProvider = new EkuboProvider() 