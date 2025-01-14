import { DexPrice } from './types'

export class PriceFeed {
  private ws: WebSocket
  private subscribers: ((price: DexPrice) => void)[] = []
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectDelay = 3000
  private dexName: string

  constructor(dexName: string, wsUrl: string) {
    this.dexName = dexName
    this.connect(wsUrl)
  }

  private connect(wsUrl: string) {
    try {
      this.ws = new window.WebSocket(wsUrl)
      
      this.ws.onmessage = (event) => {
        const price = this.parsePrice(JSON.parse(event.data))
        this.notifySubscribers(price)
      }

      this.ws.onclose = () => {
        this.handleDisconnect(wsUrl)
      }

      this.ws.onerror = (error) => {
        console.error(`WebSocket error for ${this.dexName}:`, error)
      }
    } catch (error) {
      console.error(`Failed to connect to ${this.dexName}:`, error)
      this.handleDisconnect(wsUrl)
    }
  }

  private handleDisconnect(wsUrl: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => this.connect(wsUrl), this.reconnectDelay)
    }
  }

  private parsePrice(data: any): DexPrice {
    return {
      dexName: this.dexName,
      tokenPair: data.pair,
      price: parseFloat(data.price),
      timestamp: Date.now()
    }
  }

  subscribe(callback: (price: DexPrice) => void) {
    this.subscribers.push(callback)
  }

  private notifySubscribers(price: DexPrice) {
    this.subscribers.forEach(callback => callback(price))
  }

  close() {
    if (this.ws) {
      this.ws.close()
    }
  }
} 