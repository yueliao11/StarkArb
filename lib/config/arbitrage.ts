export const ARBITRAGE_CONFIG = {
  // 最小套利阈值（以百分比表示）
  MIN_PROFIT_THRESHOLD: 0.5, // 0.5% 最小利润
  
  // 交易金额配置
  MIN_TRADE_AMOUNT: {
    ETH: BigInt('10000000000000000'), // 0.01 ETH
    USDC: BigInt('10000000'),         // 10 USDC
    USDT: BigInt('10000000'),         // 10 USDT
  },
  
  MAX_TRADE_AMOUNT: {
    ETH: BigInt('1000000000000000000'),     // 1 ETH
    USDC: BigInt('1000000000000'),  // 1000 USDC
    USDT: BigInt('1000000000000'),  // 1000 USDT
  },

  // Gas 配置
  MAX_GAS_PRICE: BigInt('100000000000'), // 100 Gwei
  MIN_PROFIT_AFTER_GAS: BigInt('20000000'), // 最小 20 USDC 利润（扣除 gas 后）
  
  // 更新频率（毫秒）
  PRICE_UPDATE_INTERVAL: 1000, // 每秒更新一次价格
  
  // 滑点设置
  SLIPPAGE_TOLERANCE: 0.5, // 0.5% 滑点容忍度
};
