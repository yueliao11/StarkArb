export const ARBITRAGE_CONFIG = {
  // 最小套利阈值（以百分比表示）
  MIN_PROFIT_THRESHOLD: 0.5, // 0.5% 最小利润
  
  // 交易金额配置
  MIN_TRADE_AMOUNT: {
    ETH: 0.01n * 10n ** 18n,  // 0.01 ETH
    USDC: 10n * 10n ** 6n,    // 10 USDC
    USDT: 10n * 10n ** 6n,    // 10 USDT
  },
  
  MAX_TRADE_AMOUNT: {
    ETH: 1n * 10n ** 18n,     // 1 ETH
    USDC: 1000n * 10n ** 6n,  // 1000 USDC
    USDT: 1000n * 10n ** 6n,  // 1000 USDT
  },

  // Gas 配置
  MAX_GAS_PRICE: 100n * 10n ** 9n, // 100 Gwei
  MIN_PROFIT_AFTER_GAS: 20n * 10n ** 6n, // 最小 20 USDC 利润（扣除 gas 后）
  
  // 更新频率（毫秒）
  PRICE_UPDATE_INTERVAL: 1000, // 每秒更新一次价格
  
  // 滑点设置
  SLIPPAGE_TOLERANCE: 0.5, // 0.5% 滑点容忍度
};
