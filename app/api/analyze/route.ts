import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { opportunity } = body

    const prompt = `
分析以下跨协议套利机会:

交易对: ${opportunity.pair}
买入平台: ${opportunity.buyDex}
卖出平台: ${opportunity.sellDex}
价格差: ${opportunity.priceGap.toFixed(2)}%
预期收益: $${opportunity.profitUSD.toFixed(2)}
交易量: $${opportunity.volume}
买入价格: $${opportunity.buyPrice}
卖出价格: $${opportunity.sellPrice}
预估 Gas: $${(opportunity.estimatedGas * 0.00005).toFixed(2)}

请从以下几个方面分析这个套利机会:
1. 收益分析: 考虑各项成本后的净收益情况
2. 风险分析: 可能存在的风险点和注意事项
3. 执行建议: 是否值得执行，以及执行时需要注意的关键点
4. 优化建议: 如何优化交易策略以提高收益或降低风险
`

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "你是一位专业的 DeFi 套利交易分析师，擅长分析跨协议套利机会。" },
        { role: "user", content: prompt }
      ],
      model: "deepseek-chat",
    })

    return NextResponse.json({ 
      analysis: completion.choices[0].message.content 
    })

  } catch (error) {
    console.error('AI Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}