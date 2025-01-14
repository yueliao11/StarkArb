import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  console.log('Starting AI analysis...')
  
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('DEEPSEEK_API_KEY is not set')
      throw new Error('API key not configured')
    }

    const body = await request.json()
    console.log('Received request body:', body)
    
    const { opportunity } = body
    if (!opportunity) {
      throw new Error('No opportunity data provided')
    }

    // 格式化数字为美元金额
    const formatUSD = (value: string | number) => {
      const num = typeof value === 'string' ? parseFloat(value) : value
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(num)
    }

    const prompt = `
分析以下跨协议套利机会:

交易对: ${opportunity.pair}
买入平台: ${opportunity.buyDex}
卖出平台: ${opportunity.sellDex}
价格差: ${opportunity.priceGap}%
预期收益: ${formatUSD(opportunity.profitUSD)}
交易量: ${formatUSD(opportunity.volume)}
买入价格: ${formatUSD(opportunity.buyPrice)}
卖出价格: ${formatUSD(opportunity.sellPrice)}
预估 Gas: ${formatUSD(Number(opportunity.estimatedGas) * 0.00005)}

请从以下几个方面分析这个套利机会:
1. 收益分析: 考虑各项成本后的净收益情况
2. 风险分析: 可能存在的风险点和注意事项
3. 执行建议: 是否值得执行，以及执行时需要注意的关键点
4. 优化建议: 如何优化交易策略以提高收益或降低风险
`

    console.log('Sending request to DeepSeek API with prompt:', prompt)
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "你是一位专业的 DeFi 套利交易分析师，擅长分析跨协议套利机会。请用简洁专业的语言分析套利机会，重点关注收益和风险。" },
        { role: "user", content: prompt }
      ],
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 1000,
    })

    console.log('Received response from DeepSeek API')
    const analysis = completion.choices[0]?.message?.content

    if (!analysis) {
      throw new Error('No analysis generated')
    }

    return NextResponse.json({ 
      analysis,
      success: true
    })

  } catch (error) {
    console.error('AI Analysis error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Analysis failed',
        success: false
      },
      { status: 500 }
    )
  }
}