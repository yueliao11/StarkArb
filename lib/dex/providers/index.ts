import { ekuboProvider } from './ekubo'
import { avnuProvider } from './avnu'
import { jediSwapProvider } from './jediswap'
import { mySwapProvider } from './myswap'

// DEX数据提供者集合
export const dexProviders = {
  ekubo: ekuboProvider,
  avnu: avnuProvider,
  jediswap: jediSwapProvider,
  myswap: mySwapProvider
} 