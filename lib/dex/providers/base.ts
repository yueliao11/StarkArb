import { DexPrice } from '../types'

export interface DexProvider {
  name: string
  wsUrl: string
  getPrice(pair: string): Promise<DexPrice>
  getHistoricalPrices(pair: string, from: number, to: number): Promise<DexPrice[]>
}

export abstract class BaseDexProvider implements DexProvider {
  constructor(
    public readonly name: string,
    public readonly wsUrl: string,
    protected readonly apiUrl: string
  ) {}

  abstract getPrice(pair: string): Promise<DexPrice>
  abstract getHistoricalPrices(pair: string, from: number, to: number): Promise<DexPrice[]>

  protected handleError(error: any): never {
    throw new Error(`${this.name} provider error: ${error.message}`)
  }
} 