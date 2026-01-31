export const SCENARIOS = [
  {
    id: 'trump-rally',
    title: '2024年7月·特朗普宾州集会',
    slug: 'presidential-election-winner-2024',
    difficulty: '极高',
    volatility: '剧烈',
    description: '一次突发的枪击事件彻底改变了选情走向。舆论反转只在毫秒之间，你能否在混乱中捕捉到Alpha？',
    tags: ['政治', '突发', '黑天鹅']
  }
];

export const TRUMP_SCRIPT = [
  { id: 's1', progress: 2, content: "宾州集会现场网络信号良好，媒体直播流接入正常", type: 'normal' },
  { id: 's2', progress: 10, content: "预测市场数据显示，特朗普胜率维持在 60% 左右", type: 'normal' },
  { id: 's3', progress: 18, content: "现场人数众多，特勤局安保措施严密", type: 'normal' },
  { id: 's4', progress: 25, content: "特朗普即将登台发表演讲", type: 'normal' },
  { id: 'r1', block: 59311100, content: "突发：集会现场传出多声巨响！", type: 'real' },
  { id: 'r2', block: 59311105, content: "特勤局特工冲上讲台，特朗普倒地！", type: 'real' },
  { id: 'r3', block: 59311120, content: "Polymarket 交易量每秒激增 500%！机器人在疯狂抛售！", type: 'real' },
  { id: 'r4', block: 59311150, content: "现场一片混乱，疏散正在进行中，直播信号一度中断", type: 'real' },
  { id: 'p1', block: 59311200, content: "特朗普被护送上车，面部有血迹但高举拳头示意！", type: 'real' },
  { id: 'p2', block: 59311300, content: "马斯克发布推特：I fully endorse President Trump.", type: 'real' },
  { id: 'p3', block: 59311400, content: "多方预测胜率已定，市场情绪开始反转", type: 'real' },
  { id: 'p4', block: 59311500, content: "拜登竞选团队暂停所有电视广告投放", type: 'normal' }
];

export const CRYPTO_NOISE = [
  "ETH Gas 费降至 12 gwei，链上活动低迷",
  "某巨鲸刚刚向币安转入 500 BTC",
  "Solana 链上 DEX 交易量小幅回落",
  "美联储会议纪要暗示下月可能维持利率不变",
  "某 DeFi 协议 TVL 突破 10 亿美元大关",
  "Aave 社区发起新的治理提案，讨论费率调整",
  "某 MEME 币 24小时涨幅超过 50%",
  "Tether 在波场链增发 10 亿 USDT",
  "Coinbase 宣布上线新的 Layer 2 网络支持",
  "Vitalik 发表关于以太坊路线图的新文章",
];
