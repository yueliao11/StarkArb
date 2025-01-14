# StarkArb

基于 Starknet 的跨协议套利系统。

## 项目特点

- 实时监控多个 DEX 的价格差异
- 自动检测和执行套利交易
- 支持多种交易对
- 完整的风险控制系统
- 实时市场数据分析

## 技术栈

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Starknet.js
- Recharts

## 主要功能

1. 钱包连接
   - 支持 Starknet 钱包
   - 实时余额显示
   - 网络切换提示

2. 套利功能
   - 自动检测套利机会
   - 最优交易量计算
   - 实时价格验证
   - 自动执行交易

3. 数据分析
   - 价格走势图表
   - 交易对分析
   - 收益分析
   - 历史交易记录

4. 系统设置
   - 自动交易开关
   - Gas 限制设置
   - 最小收益设置
   - 滑点保护

## 更新日志

### 2024-03-21
- 修复钱包连接问题
- 优化页面布局
- 完善套利功能实现

## 开发说明

1. 安装依赖
```bash
npm install
```

2. 运行开发服务器
```bash
npm run dev
```

3. 构建生产版本
```bash
npm run build
```

## 注意事项

- 确保连接到 Starknet Testnet 网络
- 建议在执行套利前先进行小额测试
- 请注意设置合理的 Gas 限制和滑点保护