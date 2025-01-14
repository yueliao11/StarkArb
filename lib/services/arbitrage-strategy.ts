import { ekuboApi } from '../api/ekubo';
import { avnuApi } from '../api/avnu';
import { ArbitrageOpportunity } from '../hooks/use-arbitrage';

export interface StrategyAnalysis {
  recommendation: 'EXECUTE' | 'SKIP';
  confidence: number; // 0-1
  reasons: string[];
  risks: string[];
  estimatedProfit: {
    amount: number;
    currency: string;
  };
  executionPlan: {
    steps: string[];
    estimatedTime: number; // 毫秒
  };
}

export class ArbitrageStrategy {
  // 分析套利机会
  static async analyzeOpportunity(
    opportunity: ArbitrageOpportunity
  ): Promise<StrategyAnalysis> {
    try {
      // 获取最新价格数据
      const [ekuboPrice, avnuPrice] = await Promise.all([
        ekuboApi.getTokenPrice(opportunity.tokenAddress),
        avnuApi.getQuote({
          tokenIn: opportunity.tokenAddress,
          tokenOut: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', // ETH
          amount: '1000000000000000000' // 1 token
        }).then(quote => 
          parseFloat(quote.amountOut) / 1e18
        )
      ]);

      // 计算实时价差
      const realPriceGap = Math.abs(ekuboPrice - avnuPrice) / Math.min(ekuboPrice, avnuPrice) * 100;
      
      // 获取 gas 成本
      const gasTokens = await avnuApi.getGasTokenPrices();
      const ethPrice = gasTokens.find(token => token.symbol === 'ETH')?.priceUSD || 0;
      const estimatedGasCost = opportunity.estimatedGas * ethPrice;

      // 评估流动性
      const poolStats = opportunity.poolId 
        ? await ekuboApi.getPoolStats(opportunity.poolId)
        : null;

      // 计算置信度
      let confidence = 0;
      const reasons: string[] = [];
      const risks: string[] = [];

      // 1. 价差分析
      if (realPriceGap >= opportunity.priceGap) {
        confidence += 0.3;
        reasons.push(`价差稳定且有利：${realPriceGap.toFixed(2)}%`);
      } else {
        confidence -= 0.2;
        risks.push(`价差已缩小至 ${realPriceGap.toFixed(2)}%`);
      }

      // 2. 流动性分析
      if (poolStats && parseFloat(poolStats.liquidity) > parseFloat(opportunity.volume) * 10) {
        confidence += 0.2;
        reasons.push('充足的流动性支持');
      } else {
        confidence -= 0.1;
        risks.push('流动性可能不足');
      }

      // 3. Gas 成本分析
      const profitAfterGas = opportunity.profitUSD - estimatedGasCost;
      if (profitAfterGas > 50) { // 最小 $50 利润
        confidence += 0.2;
        reasons.push(`扣除 Gas 后预期利润: $${profitAfterGas.toFixed(2)}`);
      } else {
        confidence -= 0.3;
        risks.push(`扣除 Gas 后利润过低: $${profitAfterGas.toFixed(2)}`);
      }

      // 4. 历史成功率分析（模拟数据）
      const historicalSuccess = Math.random() > 0.3;
      if (historicalSuccess) {
        confidence += 0.1;
        reasons.push('该路径历史成功率较高');
      } else {
        risks.push('该路径历史成功率较低');
      }

      // 5. 市场波动分析
      const volatility = Math.random() * 10; // 模拟波动率
      if (volatility < 5) {
        confidence += 0.1;
        reasons.push('市场波动性较低');
      } else {
        risks.push('市场波动性较高');
      }

      // 归一化置信度到 0-1 范围
      confidence = Math.max(0, Math.min(1, confidence));

      // 生成执行计划
      const executionPlan = {
        steps: [
          `1. 在 ${opportunity.buyDex} 购买 ${opportunity.volume} ${opportunity.pair.split('/')[0]}`,
          `2. 等待交易确认（预计 15-30 秒）`,
          `3. 在 ${opportunity.sellDex} 卖出获得的代币`,
          `4. 预期获利 $${profitAfterGas.toFixed(2)}`
        ],
        estimatedTime: 30000 // 预计 30 秒
      };

      return {
        recommendation: confidence > 0.6 ? 'EXECUTE' : 'SKIP',
        confidence,
        reasons,
        risks,
        estimatedProfit: {
          amount: profitAfterGas,
          currency: 'USD'
        },
        executionPlan
      };
    } catch (error) {
      console.error('Error analyzing opportunity:', error);
      throw error;
    }
  }

  // 验证套利机会是否仍然有效
  static async validateOpportunity(
    opportunity: ArbitrageOpportunity
  ): Promise<boolean> {
    try {
      const analysis = await this.analyzeOpportunity(opportunity);
      return analysis.recommendation === 'EXECUTE' && analysis.confidence > 0.7;
    } catch (error) {
      console.error('Error validating opportunity:', error);
      return false;
    }
  }

  // 估算最优交易量
  static async estimateOptimalAmount(
    opportunity: ArbitrageOpportunity
  ): Promise<string> {
    try {
      // 获取池子信息
      const poolStats = opportunity.poolId 
        ? await ekuboApi.getPoolStats(opportunity.poolId)
        : null;

      if (!poolStats) {
        return opportunity.volume; // 如果无法获取池子信息，返回原建议量
      }

      // 计算最优交易量（考虑流动性和价格影响）
      const liquidity = parseFloat(poolStats.liquidity);
      const maxTradeVolume = liquidity * 0.01; // 限制在流动性的 1%
      const suggestedVolume = parseFloat(opportunity.volume);

      // 返回较小值
      return Math.min(maxTradeVolume, suggestedVolume).toString();
    } catch (error) {
      console.error('Error estimating optimal amount:', error);
      return opportunity.volume; // 发生错误时返回原建议量
    }
  }
}
