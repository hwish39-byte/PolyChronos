# PolyChronos  —— 穿越链上历史，重塑预测市场的交互式教育体验

> **SPARK AI Hackathon - Track 3 参赛作品**

## 📖 核心痛点 (Problem)

Polymarket 作为预测市场的领头羊，其核心价值在于汇聚群体智慧。然而，对于大多数试图进入这一领域的新手用户而言，横亘着两座大山：

*   **信息差陷阱 (Information Asymmetry Trap)**：链上价格波动与链下新闻流（News Feed）往往存在错位。新手看着 K 线的剧烈跳动，却不知道当时究竟发生了什么（Why it happened?），导致无法建立有效的市场直觉。
*   **高昂的实战学费 (High Tuition Fees)**：预测市场是零和博弈，新手在缺乏经验的情况下直接用真金白银试错，往往会沦为“退出流动性 (Exit Liquidity)”，这种挫败感严重阻碍了生态的各种普及。

## 🔭 产品愿景 (Vision)

**PolyChronos (聚时)** 致力于构建预测市场的**“时间模拟器”**。

我们不创造数据，而是**重塑数据的呈现方式**。通过将枯燥的链上原始日志（Raw Logs）转化为可感知的、带有叙事逻辑的**交互式教学剧本**，我们让用户在零风险的环境中，像玩游戏一样穿越回历史的关键时刻（如 2024 大选之夜），在高强度的模拟决策中习得对信号（Signal）与噪音（Noise）的敏锐嗅觉。

## ✨ 核心功能 (Features)

### 1. 时空回溯回测引擎 (Time-Travel Backtesting Engine)
*   **毫秒级还原**：基于 Recharts 和定制渲染层，精准还原 Polygon 链上真实的赔率跳变曲线。拒绝 K 线“事后诸葛亮”的上帝视角，所有数据随着模拟时间轴逐点生成，还原未知的紧张感。

### 2. AI 语境重构 (Context Reconstruction)
*   **逻辑对齐**：结合 **SpoonOS** 的能力，将历史时刻的新闻流（Breaking News）、社交媒体情绪与交易点位完美对齐。
*   **消除盲区**：彻底解决传统回测“只有波动、没有逻辑”的痛点，让用户明白每一次暴涨暴跌背后的驱动力。

### 3. 盲测挑战模式 (Blind Mode)
*   **剥离叙事**：一键隐藏所有新闻与事件背景，仅保留盘口数据。
*   **纯粹试炼**：考验用户在没有任何叙事干扰下，仅凭盘口异动（Orderbook Flow）识别巨鲸意图的能力。

### 4. 高能时刻视觉反馈 (High-Energy Visual Feedback)
*   **波动感知**：内置波动率算法实时监测市场热度。
*   **全屏预警**：当检测到价格在 3秒内跳变超过 10% 时，触发全屏震动与红色呼吸光晕特效，模拟极端行情下的肾上腺素飙升体验。

## 🛠️ 技术栈与实现细节 (Technical Stack)

### 数据获取 (Data Retrieval)
*   **DataDance SDK**：本项目集成 DataDance SDK 高效获取 Polymarket 历史市场索引与元数据，确保数据源的完整性与时效性。

### 底层解码 (Underlying Decoding)
针对 Polymarket 基于的 **Gnosis CTF (Conditional Tokens Framework)** 协议，我们实现了深度的事件解码器：
*   **多版本 ABI 适配**：精准识别 `0x4bFb...` (Exchange Loop) 与 `0xC5d5...` (NegRisk Adapter) 合约。
*   **复杂事件解析**：特别是针对 **NegRisk 适配器**，我们解决了 `OrderFilled` 事件中 `makerAssetId` 与 `takerAssetId` 的动态映射问题，以及 `collateralAmount` 到标准价格（0-100¢）的非线性转换逻辑。

### 工程挑战 (Engineering Challenges)
为了在无需自建全节点的情况下获取海量历史数据，我们设计了高鲁棒性的同步架构：
*   **分片扫描 (Chunk-based Indexing)**：将数百万个区块划分为微小的 `chunk` 并行处理，极大提高了扫描效率。
*   **断点续传机制**：引入 `sync_state` 数据库表记录每个合约的 `last_synced_block`。即使遇到公共 RPC 节点的 `429 Too Many Requests` 限制或网络中断，系统也能自动回退并从断点处无缝恢复，无需从头开始。

## 🎯 激励与画像系统 (Incentive)

我们引入了 **Insight Score** 评分算法，从多个维度量化用户的交易能力：
*   **Alpha Hunter**：授予高 ROI 且 **Insight Latency**（洞察时延）极低的用户，代表其拥有敏锐的市场嗅觉。
*   **Smart Money**：授予盈利稳定、回撤控制良好的用户。
*   **Exit Liquidity**：对于表现不佳的用户，系统会生成带有幽默感的 AI 毒舌点评（Roast），在娱乐中完成投资者教育。

## 💼 商业价值 (Business Value)

**PolyChronos 是交易所（CEX/DEX）的最佳前置教育入口。**
*   **降低获客成本**：通过游戏化的模拟体验吸引 Web2 用户，转化为 Web3 预测市场的熟练玩家。
*   **提升留存率**：经过模拟训练的用户更懂规则、更少亏损，从而在真实市场中拥有更长的生命周期（LTV）。

## 🚀 运行指南 (Getting Started)

### 前置要求
*   Node.js v18+
*   SQLite3

### 1. 安装依赖
```bash
npm install
```

### 2. 初始化数据库
创建本地 SQLite 数据库及表结构：
```bash
npm run init-db
```

### 3. 同步市场元数据
拉取 Polymarket 的热门市场列表：
```bash
node scripts/syncMarkets.js
```

### 4. 抓取历史交易数据
从链上抓取指定市场的历史成交记录（支持断点续传）：
```bash
npm run fetch-data
```

### 5. 启动后端服务
开启 API 服务器，提供数据接口：
```bash
npm start
```

### 6. 启动前端应用
在新的终端窗口中运行：
```bash
npm run dev
```
访问 `http://localhost:5173` 开启您的时空回溯之旅。

---

**PolyChronos** - Built for SPARK AI Hackathon 2024.
