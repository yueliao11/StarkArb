import { BaseDexProvider } from './base'
import { DexPrice } from '../types'

export class AvnuProvider extends BaseDexProvider {
  constructor() {
    super(
      'Avnu',
      'wss://api.avnu.fi/ws/v1',
      'https://api.avnu.fi/v1'
    )
  }

  async getPrice(pair: string): Promise<DexPrice> {
    try {
      const response = await fetch(`${this.apiUrl}/quote?pair=${pair}`)
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
        `${this.apiUrl}/historical?pair=${pair}&from=${from}&to=${to}`
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

export const avnuProvider = new AvnuProvider() 