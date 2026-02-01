<div align="center">
  <img src="https://via.placeholder.com/800x200?text=PolyChronos+Logo" alt="PolyChronos Logo" width="100%" />
</div>

# PolyChronos

> **穿越链上历史，在真实回测中掌握预测市场的艺术。**

---

##  赞助商技术栈列表 (Sponsor Tech Stack)

以下是本项目集成的赞助商技术，方便检索与致谢：

| 赞助商 | 使用的具体技术点 |
| :--- | :--- |
| **DataDance (数据舞蹈)** | 使用 SDK 进行高频成交日志索引、去重与数据预处理 |
| **Polygon (多边形)** | 核心数据源，深度解析 NegRisk Exchange 原始合约日志 |
| **SpoonOS** | AI 驱动的历史新闻流还原与“毒舌教练”点评逻辑重构 |
| **Polymarket (多元市场)** | 核心业务模型参考，遵循 Gnosis CTF 协议规范 |

---

##  技术架构 (Tech Architecture)

本项目采用现代化的全栈架构，确保高性能与极致的用户体验：

*   ** 前端 (Frontend)**
    *   React 18 + Tailwind CSS v4
    *   Recharts (60FPS 插值平滑动效)
*   ** 后端 (Backend)**
    *   Node.js + Express
    *   better-sqlite3 (高性能本地嵌入式数据库)
*   ** Web3 交互**
    *   Wagmi + RainbowKit + Ethers.js v6
*   ** 数据索引层**
    *   自主开发的区块链日志解码引擎，直接处理 Raw Event Logs

---

##  核心亮点 (Core Highlights)

### 1.协议级深度解码
不依赖三方 API，直接还原 **Gnosis CTF (Conditional Token Framework)** 协议下的 `collateralAmount` 与 `returnAmount`，精准重现 7.13 事件赔率波动。

### 2.消除“事后诸葛亮”偏差
强制引入 **3秒执行延迟** 与 **5% 惩罚性滑点**，向用户证明即使已知结局，在 Web3 真实阻力下捕捉 Alpha 依然极具挑战。

### 3.灵魂绑定奖励机制
用户回测战绩将根据 ROI 与响应时延生成“交易员画像”，并可在 Sepolia 测试网铸造不可转让的 **SBT (灵魂绑定代币)** 勋章。

---

##  快速开始 (Quick Start)

### 环境要求
*   Node.js 18+ / npm
*   有效的 Polygon RPC URL (用于数据同步)
*   Sepolia 测试网测试币 (用于勋章铸造)

### 安装步骤

1.  **克隆仓库**
    ```bash
    git clone https://github.com/hwish39-byte/PolyChronos.git
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置环境变量**
    ```bash
    cp .env.example .env
    # 请在 .env 中配置 RPC 地址
    ```

### 运行命令

1.  **初始化数据库**
    ```bash
    npm run init-db
    ```

2.  **同步历史数据**
    ```bash
    node scripts/fetchScenario.js
    # 注意：项目已内置 10,000 区块数据，初次体验可跳过此步
    ```

3.  **启动后端 API**
    ```bash
    node server.js
    # 服务端口: 3001
    ```

4.  **启动前端界面**
    ```bash
    npm run dev
    # 服务端口: 5173
    ```

---

##  功能说明 (Features)

*   ** 时空回放**：线性插值技术实现 K 线小球丝滑移动，无感跳跃。
*   ** 连续交易模式**：支持 10万U 本金、自由平仓与杠杆操作模拟。
*   ** AI 实时情报流**：根据区块高度动态推送带信噪比的历史推特流。

---

##  数据来源 (Data Source)

*   **来源**：Polygon Mainnet
*   **方式**：通过 **DataDance SDK** 与原始 RPC 节点获取 **NegRisk_CTFExchange** 合约 (`0xC5d563...`) 的 `OrderFilled` 原始日志，解码率为 100%。

---

<div align="center">
  <i>Made with ❤️ by PolyChronos Team</i>
</div>
