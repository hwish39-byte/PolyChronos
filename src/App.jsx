import { useState, useEffect, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from 'recharts';
import PriceChart from './components/PriceChart';
import axios from 'axios';
import { Scan, Activity, Trophy, ArrowRight, RotateCcw, Flag, Newspaper, DollarSign, TrendingUp, TrendingDown, Clock, LogOut } from 'lucide-react';

// --- Constants & Data ---
const SCENARIOS = [
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

const TRUMP_SCRIPT = [
    // Phase 1: Pre-Event Context (Normal)
    { id: 's1', progress: 2, content: "宾州集会现场网络信号良好，媒体直播流接入正常", type: 'normal' },
    { id: 's2', progress: 10, content: "预测市场数据显示，特朗普胜率维持在 60% 左右", type: 'normal' },
    { id: 's3', progress: 18, content: "现场人数众多，特勤局安保措施严密", type: 'normal' },
    { id: 's4', progress: 25, content: "特朗普即将登台发表演讲", type: 'normal' },

    // Phase 2: Outbreak (Real Signals - Red/Bold)
    // Using block numbers for precise sync with price action
    { id: 'r1', block: 59311100, content: "🚨 **突发：集会现场传出多声巨响！**", type: 'real' },
    { id: 'r2', block: 59311105, content: "⚠️ **特勤局特工冲上讲台，特朗普倒地！**", type: 'real' },
    { id: 'r3', block: 59311120, content: "📉 **Polymarket 交易量每秒激增 500%！机器人在疯狂抛售！**", type: 'real' },
    { id: 'r4', block: 59311150, content: "现场一片混乱，疏散正在进行中，直播信号一度中断", type: 'real' },

    // Phase 3: Aftermath (Commentary)
    { id: 'p1', block: 59311200, content: "特朗普被护送上车，面部有血迹但高举拳头示意！", type: 'real' },
    { id: 'p2', block: 59311300, content: "马斯克发布推特：I fully endorse President Trump.", type: 'real' },
    { id: 'p3', block: 59311400, content: "多方预测胜率已定，市场情绪开始反转", type: 'real' },
    { id: 'p4', block: 59311500, content: "拜登竞选团队暂停所有电视广告投放", type: 'normal' }
];

const CRYPTO_NOISE = [
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
    "MicroStrategy 再次购入 1000 BTC",
    "某匿名巨鲸转移 5000 万 USDC 到 Coinbase",
    "SEC 主席推迟了关于 ETF 的决议",
    "黑客攻击导致某跨链桥损失 200 万美元",
    "Glassnode 数据显示长期持有者未动",
    "Pantera Capital 发布新的市场研报",
    "某 Layer 1 区块链主网升级成功",
    "USDT 市值创下历史新高",
    "NFT 市场交易量本周下跌 20%",
    "某知名 KOL 称牛市即将到来"
];

// --- Helper Components ---

const FlagMarker = (props) => {
    const { cx, cy } = props;
    return (
        <svg x={cx - 10} y={cy - 20} width="20" height="20" viewBox="0 0 24 24" fill="#ff003c" stroke="white" strokeWidth="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
    );
};

const LoadingScreen = ({ status, onEnter }) => {
    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000_100%)]"></div>
            
            <div className="z-10 flex flex-col items-center gap-8">
                {/* Loader / Icon */}
                <div className="relative">
                    <div className={`w-24 h-24 border-4 border-blue-500/30 rounded-full ${status === 'fetching' ? 'animate-spin' : ''}`}></div>
                    <div className={`absolute inset-0 border-t-4 border-blue-500 rounded-full ${status === 'fetching' ? 'animate-spin' : ''}`}></div>
                    {status === 'ready' && (
                        <div className="absolute inset-0 flex items-center justify-center animate-scale-up">
                            <Activity className="w-10 h-10 text-blue-400" />
                        </div>
                    )}
                </div>

                {/* Text Status */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold tracking-widest uppercase">
                        {status === 'fetching' ? 'SYNCING CHAIN DATA' : 'SYSTEM READY'}
                    </h2>
                    <p className="text-sm text-gray-500 animate-pulse">
                        {status === 'fetching' ? '正在同步 7 月 13 日链上快照...' : '数据加载完成 (Data Loaded)'}
                    </p>
                </div>

                {/* Enter Button */}
                {status === 'ready' && (
                    <button 
                        onClick={onEnter}
                        className="mt-4 px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-[0.2em] uppercase rounded shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:shadow-[0_0_50px_rgba(37,99,235,0.8)] transition-all animate-fade-in active:scale-95"
                    >
                        进入模拟 (ENTER)
                    </button>
                )}
            </div>
        </div>
    );
};

// Data Processing Helper
const processTradeData = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    return rawData.map((trade, index) => {
        if (!trade) return null;
        let price = trade.price;
        
        // Normalize 1-100 to 0.01-1.00
        if (price > 1) price = price / 100;
        
        // Price Clamping (0.01 - 0.99)
        if (price > 0.99) price = 0.99;
        if (price < 0.01) price = 0.01;
        
        return {
            ...trade,
            price,
            size: trade.size || 0, // Ensure size exists
            simTime: index,
            displayTime: new Date(trade.time * 1000).toLocaleTimeString()
        };
    }).filter(item => item !== null);
};

// --- Main Components ---

const Lobby = ({ onSelect, blindMode, setBlindMode }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-serif p-8 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#000_100%)] -z-10"></div>
      
      <header className="w-full max-w-6xl flex justify-between items-center mb-16 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-2">
            <Activity className="text-blue-400 w-6 h-6" />
            <h1 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">
                PolyChronos·聚时
            </h1>
        </div>
        <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer gap-2 group">
                <span className={`text-sm tracking-widest transition-colors ${blindMode ? 'text-red-400' : 'text-gray-500'} group-hover:text-gray-300`}>
                    {blindMode ? '盲测模式: 开启' : '盲测模式: 关闭'}
                </span>
                <button 
                    onClick={() => setBlindMode(!blindMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${blindMode ? 'bg-red-900' : 'bg-gray-800'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${blindMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </label>
        </div>
      </header>

      <main className="w-full max-w-6xl">
        <h2 className="text-4xl font-serif font-light mb-8 text-gray-100 border-l-4 border-blue-500 pl-6">
            场景大厅
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SCENARIOS.map(scenario => (
                <div 
                    key={scenario.id}
                    onClick={() => onSelect(scenario)}
                    className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,243,255,0.1)]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className="px-2 py-1 text-xs font-bold text-red-400 border border-red-400/30 rounded bg-red-400/10">
                            {scenario.difficulty}
                        </span>
                        <Scan className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 text-gray-100 group-hover:text-blue-300 transition-colors">
                        {scenario.title}
                    </h3>
                    
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed font-sans">
                        {scenario.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <div className="flex gap-2">
                            {scenario.tags.map(tag => (
                                <span key={tag} className="text-xs text-gray-500">#{tag}</span>
                            ))}
                        </div>
                        <div className="flex items-center text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            开始模拟 <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                    </div>
                </div>
            ))}
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-6 flex flex-col justify-center items-center text-gray-600 opacity-50 grayscale">
                <Scan className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm tracking-widest">更多场景即将推出</p>
            </div>
        </div>
      </main>
    </div>
  );
};

const Simulation = ({ slug, blindMode, onFinish, preloadedData }) => {
  const [allData, setAllData] = useState(preloadedData || []);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentPrice = useMemo(() => {
    if (!allData || allData.length === 0) return 0;
    const floorIndex = Math.floor(currentIndex);
    const fraction = currentIndex - floorIndex;
    
    if (floorIndex < 0) return allData[0].price;
    if (floorIndex >= allData.length - 1) return allData[allData.length - 1].price;
    
    const p1 = allData[floorIndex].price;
    const p2 = allData[floorIndex + 1]?.price ?? p1;
    
    return p1 + (p2 - p1) * fraction;
  }, [currentIndex, allData]);
  const [loading, setLoading] = useState(!preloadedData || preloadedData.length === 0);
  const [priceFlash, setPriceFlash] = useState(false);
  
  // Simulation Control
  const [speed, setSpeed] = useState(60); // Default speed (0.06s)
  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [userSpeedMultiplier, setUserSpeedMultiplier] = useState(1); // 1x, 2x, 4x
  const [isScanning, setIsScanning] = useState(false); // For auto-skip animation
  const [toastMsg, setToastMsg] = useState(null);
  
  // Trading State
  const [buyAmount, setBuyAmount] = useState(''); // User input for buy amount
  
  // Volatility State
  const [isVolatile, setIsVolatile] = useState(false);
  const volatilityTimeoutRef = useRef(null);

  // AI News Generator State
  const [newsFeed, setNewsFeed] = useState([]);
  
  // User Interaction State
  const [balance, setBalance] = useState(10000); // Starting Virtual Balance
  const [shares, setShares] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [totalFees, setTotalFees] = useState(0);
  const [lastBuyTime, setLastBuyTime] = useState(0);
  const [isPendingOrder, setIsPendingOrder] = useState(false);
  
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // New state for start overlay
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  
  // Refs for Latency Logic
  const currentIndexRef = useRef(currentIndex);
  const balanceRef = useRef(balance);
  const sharesRef = useRef(shares);
  const allDataRef = useRef(allData);
  const buyTimeoutRef = useRef(null);
  const sellTimeoutRef = useRef(null);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    balanceRef.current = balance;
    sharesRef.current = shares;
    allDataRef.current = allData;
  }, [currentIndex, balance, shares, allData]);

  // Cleanup timeouts on unmount
  useEffect(() => {
      return () => {
          if (buyTimeoutRef.current) clearTimeout(buyTimeoutRef.current);
          if (sellTimeoutRef.current) clearTimeout(sellTimeoutRef.current);
      };
  }, []);

  // Real-time Equity & PnL
  const equity = balance + (shares * currentPrice);
  const pnlPercent = ((equity - 1000) / 1000) * 100;
  
  // Constants
  const SIGNAL_INDEX = 10; 
  const newsListRef = useRef(null);
  const triggeredScriptIds = useRef(new Set());
  const eventTriggerIndexRef = useRef(null); // Track when the big news happened

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/trades/${slug}`);
        const rawData = response.data;

        const cleanData = rawData.map((trade, index) => {
          let price = trade.price;
          
          // Normalize 1-100 to 0.01-1.00
          if (price > 1) price = price / 100;
          
          // Price Clamping (0.01 - 0.99)
          if (price > 0.99) price = 0.99;
          if (price < 0.01) price = 0.01;
          
          return {
            ...trade,
            price,
            size: trade.size || 0, // Ensure size exists
            simTime: index,
            displayTime: new Date(trade.time * 1000).toLocaleTimeString()
          };
        });

        setAllData(cleanData);
        
        // --- Auto-Skip Logic for Low Volatility ---
        let initialized = false;
        if (cleanData.length > 100) {
            const first100 = cleanData.slice(0, 100);
            const minP = Math.min(...first100.map(d => d.price));
            const maxP = Math.max(...first100.map(d => d.price));
            const vol = (maxP - minP) / minP;

            // If volatility < 1%, skip to outbreak
            if (vol < 0.01) {
                const outbreakBlock = 59311100; // Hardcoded from TRUMP_SCRIPT
                const outbreakIndex = cleanData.findIndex(d => (d.blockNumber || 0) >= outbreakBlock);
                
                if (outbreakIndex > 100) {
                    const jumpIndex = Math.max(0, outbreakIndex - 20);
                    
                    console.log(`📉 Low Volatility Detected (${(vol*100).toFixed(2)}%). Auto-skipping to index ${jumpIndex}`);
                    
                    setIsScanning(true);
                    setCurrentIndex(jumpIndex);
                    
                    // Artificial delay for "Scanning" animation
                    setTimeout(() => {
                        setIsScanning(false);
                    }, 2000);
                    
                    initialized = true;
                }
            }
        }

        // Default initialization if no skip happened
        if (!initialized && cleanData.length > 0) {
            // Initial state is already 0, no need to set explicitly
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trades:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const playAlertSound = () => {
    // Placeholder for alert sound
    console.log("🔊 PLAYING ALERT SOUND: HIGH VOLATILITY DETECTED");
  };

  // Volatility Monitoring
  useEffect(() => {
    if (currentIndex < 30 || !allData[currentIndex]) return;

    const currentTrade = allData[currentIndex];
    const pastTrade = allData[currentIndex - 5]; // Check last 5 trades for faster reaction

    if (currentTrade && pastTrade && pastTrade.price > 0) {
        const priceChange = Math.abs((currentTrade.price - pastTrade.price) / pastTrade.price);
        
        // Trigger if > 10% change
        if (priceChange > 0.10) {
            if (!isVolatile) {
                playAlertSound();
            }
            setIsVolatile(true);
            
            // Clear existing timeout to extend duration
            if (volatilityTimeoutRef.current) clearTimeout(volatilityTimeoutRef.current);
            
            // Reset after 3 seconds
            volatilityTimeoutRef.current = setTimeout(() => {
                setIsVolatile(false);
            }, 3000);
        }
    }
  }, [currentIndex, allData, isVolatile]);

  // Simulation Loop (RAF)
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  useEffect(() => {
    if (loading || allData.length === 0 || isFinishing || isPaused || !hasStarted) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        lastTimeRef.current = null;
        return;
    }

    const loop = (time) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const delta = time - lastTimeRef.current;
        lastTimeRef.current = time;

        // Calculate increment
        // Speed is "ms per tick". 
        // increment = (delta / speed) * multiplier
        // e.g. 16ms / 60ms * 1 = 0.26 ticks
        const increment = (delta / speed) * userSpeedMultiplier;

        setCurrentIndex(prevIndex => {
            const nextIndex = prevIndex + increment;
            
            if (nextIndex >= allData.length - 1) {
                const safeIndex = Math.min(Math.floor(nextIndex), allData.length - 1);
                handleSimulationEnd(safeIndex);
                return allData.length - 1;
            }
            return nextIndex;
        });

        rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loading, allData, speed, isFinishing, userSpeedMultiplier, isPaused, hasStarted]);

  // Logic Effect: Runs when Integer Index changes
  useEffect(() => {
      const index = Math.floor(currentIndex);
      if (index < 0 || !allData[index]) return;

      const currentTrade = allData[index];

      // 1. Update Progress
      const newProgress = (index / (allData.length - 1)) * 100;
      setProgress(newProgress);

      // 2. Scenario Scripts / News Triggers
      // Check for block-based triggers
      if (currentTrade.blockNumber) {
          const matchingEvents = TRUMP_SCRIPT.filter(event => 
              event.block && 
              event.block <= currentTrade.blockNumber && 
              !triggeredScriptIds.current.has(event.id)
          );
          
          matchingEvents.forEach(event => {
              triggeredScriptIds.current.add(event.id);
              
              // Special handling for "Real" events (Red/Bold)
              const isReal = event.type === 'real';
              
              setNewsFeed(prev => [{
                  id: event.id,
                  content: event.content,
                  time: currentTrade.displayTime,
                  isReal,
                  block: currentTrade.blockNumber
              }, ...prev]);

              if (isReal) {
                  setPriceFlash(true);
                  setTimeout(() => setPriceFlash(false), 500);
                  // Mark the "Big Event" index for Alpha scoring
                  if (eventTriggerIndexRef.current === null) {
                      eventTriggerIndexRef.current = index;
                  }
              }
          });
      }

      // Check for progress-based triggers (fallback)
      const matchingProgressEvents = TRUMP_SCRIPT.filter(event => 
          event.progress && 
          event.progress <= newProgress && 
          !triggeredScriptIds.current.has(event.id)
      );

      matchingProgressEvents.forEach(event => {
          triggeredScriptIds.current.add(event.id);
          setNewsFeed(prev => [{
              id: event.id,
              content: event.content,
              time: currentTrade.displayTime,
              isReal: false
          }, ...prev]);
      });

      // 3. AI News Generator (Random Noise)
      // 5% chance per tick to generate noise if no real news
      if (Math.random() < 0.05) {
          const randomNews = CRYPTO_NOISE[Math.floor(Math.random() * CRYPTO_NOISE.length)];
          // Only add if we haven't added recently (simple check omitted for brevity)
          // setNewsFeed(prev => ... ) // Optional: Keep it clean for now
      }

      // 4. Speed Control (Gap Detection)
      // If time difference between current and next trade is huge (> 1 hour), skip or speed up?
      // For now, we rely on the pre-calculation in fetchData.
      
  }, [Math.floor(currentIndex), allData]);


  // Auto-scroll News Feed
  useEffect(() => {
    if (newsListRef.current) {
        newsListRef.current.scrollTop = 0;
    }
  }, [newsFeed]);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Early Exit Logic
  useEffect(() => {
    if (isFinishing) {
        if (shares > 0) {
            handleSell(true); // Force sell
        } else {
            // Once sold (or if no shares), finish the game
            handleSimulationEnd(Math.floor(currentIndex));
            setIsFinishing(false);
        }
    }
  }, [isFinishing, shares]);

  // Real-time PnL Calculation (Derived State)
  // Removed useEffect as pnlPercent is now calculated directly above

  const handleSimulationEnd = (finalIndex) => {
    const finalPrice = allData[finalIndex].price;
    const finalEquity = balance + (shares * finalPrice);
    const INITIAL_CAPITAL = 10000;
    const totalPnL = finalEquity - INITIAL_CAPITAL;
    const roi = (totalPnL / INITIAL_CAPITAL) * 100;
    
    // --- 1. Hodl Strategy Calculation ---
    // Assuming buy at start (or first available price) with full capital
    const initialPrice = allData[0].price;
    const hodlShares = INITIAL_CAPITAL / initialPrice;
    const hodlEquity = hodlShares * finalPrice;
    const hodlRoi = ((hodlEquity - INITIAL_CAPITAL) / INITIAL_CAPITAL) * 100;

    // --- 2. Max Drawdown Calculation ---
    let tempBalance = INITIAL_CAPITAL;
    let tempShares = 0;
    let peakEquity = INITIAL_CAPITAL;
    let maxDrawdown = 0;
    
    // Create a map of trades by index for fast lookup
    const tradesByIndex = {};
    tradeHistory.forEach(t => {
        if (!tradesByIndex[t.index]) tradesByIndex[t.index] = [];
        tradesByIndex[t.index].push(t);
    });

    for (let i = 0; i <= finalIndex; i++) {
        const p = allData[i].price;
        
        // Process trades at this index
        if (tradesByIndex[i]) {
            tradesByIndex[i].forEach(t => {
                if (t.type === 'BUY') {
                    tempBalance -= t.amount;
                    tempShares += t.quantity;
                } else {
                    tempBalance += t.amount;
                    tempShares -= t.quantity; // Should be 0 usually
                }
            });
        }
        
        const currentEq = tempBalance + (tempShares * p);
        if (currentEq > peakEquity) peakEquity = currentEq;
        
        const dd = (peakEquity - currentEq) / peakEquity;
        if (dd > maxDrawdown) maxDrawdown = dd;
    }

    // --- 3. Persona & Roast Logic (Enhanced) ---
    const totalTrades = tradeHistory.length;
    let persona = "";
    let roast = "";
    
    // Metrics
    const netPnL = totalPnL - totalFees; // Real PnL after fees
    
    // Find key events
    const outbreakBlock = 59311100; // Shooting event
    const outbreakIndex = allData.findIndex(d => (d.blockNumber || 0) >= outbreakBlock);
    
    // Detailed Trade Analysis
    let tradeAnalysis = [];
    let goodTrades = 0;
    let badTrades = 0;
    
    // Sort trades chronologically (oldest to newest)
    const sortedTrades = [...tradeHistory].sort((a, b) => a.index - b.index);
    
    if (sortedTrades.length > 0) {
        sortedTrades.forEach((trade, i) => {
            const tradeTime = trade.index;
            const isBuy = trade.type === 'BUY';
            const price = trade.price;
            
            // Check proximity to outbreak
            const distToOutbreak = tradeTime - outbreakIndex;
            
            if (outbreakIndex !== -1) {
                // Scenario 1: Pre-Event
                if (distToOutbreak < -50) {
                     // Normal trading, check local min/max? Skip for brevity unless huge loss
                }
                // Scenario 2: Just before/during event (The "Insider" Zone)
                else if (distToOutbreak >= -10 && distToOutbreak < 20) {
                    if (isBuy) {
                        tradeAnalysis.push(`✅ 关键操作：你在枪击案发生前后精准买入($${price.toFixed(2)})，抓住了黄金窗口。`);
                        goodTrades++;
                    } else {
                        tradeAnalysis.push(`❌ 致命失误：枪击案刚发生你就卖飞了($${price.toFixed(2)})，将暴富机会拱手让人。`);
                        badTrades += 2; // Heavily penalized
                    }
                }
                // Scenario 3: The Pump (20-100 ticks after)
                else if (distToOutbreak >= 20 && distToOutbreak < 150) {
                     if (isBuy) {
                         if (price > 0.8) {
                             tradeAnalysis.push(`⚠️ 追高风险：价格已经飙升至 $${price.toFixed(2)}，你还在追涨，典型的FOMO心态。`);
                             badTrades++;
                         } else {
                             tradeAnalysis.push(`✅ 顺势而为：趋势确立后果断上车($${price.toFixed(2)})，吃到了鱼身行情。`);
                             goodTrades++;
                         }
                     } else {
                         if (price > 0.85) {
                             tradeAnalysis.push(`✅ 逃顶大师：在 $${price.toFixed(2)} 高位精准止盈，落袋为安。`);
                             goodTrades++;
                         }
                     }
                }
                // Scenario 4: Late Game
                else if (distToOutbreak >= 150) {
                     // Late game logic
                }
            }
        });
    }

    // Persona Generation
    if (totalTrades === 0) {
        persona = "佛系路人 (Spectator)";
        roast = "面对改变历史的黑天鹅事件，你选择了... 什么都不做？也许这才是最高的境界，至少你没亏钱。";
    } else {
        if (netPnL < -INITIAL_CAPITAL * 0.5) {
             persona = "慈善赌王 (Philanthropist)";
             roast = `本金腰斩！${tradeAnalysis[0] || "你的操作完全是被情绪左右。"} 建议卸载App，或是去寺庙静修。`;
        } else if (netPnL < 0) {
             persona = "韭菜 (Leek)";
             roast = `一顿操作猛如虎，一看亏损两千五。${tradeAnalysis[0] || "频繁交易只会以此收场。"} 市场收割的就是你这种“努力”的人。`;
        } else if (netPnL < INITIAL_CAPITAL * 0.1) {
             persona = "保本大师 (Survivor)";
             roast = `除去手续费基本白忙活。${tradeAnalysis.find(t => t.includes('⚠️')) || "虽然没亏大钱，但也没抓到大机会。"} 在这种大行情里只赚这点，其实也是一种亏损。`;
        } else if (netPnL < INITIAL_CAPITAL * 0.5) {
             persona = "顺势交易员 (Trader)";
             roast = `表现不错！${tradeAnalysis.find(t => t.includes('✅')) || "你捕捉到了部分趋势。"} 虽然离顶级玩家还有差距，但已经跑赢了绝大多数人。`;
        } else if (netPnL < INITIAL_CAPITAL * 2) {
             persona = "华尔街之狼 (Wolf of Wall Street)";
             roast = `精彩的操作！${tradeAnalysis.find(t => t.includes('✅')) || "你对市场的敏锐度令人惊叹。"} 你的每一笔交易都充满了逻辑，资产翻倍是你应得的奖赏。`;
        } else {
             persona = "时间旅行者 (Time Traveler)";
             roast = `神！请收下我的膝盖！${tradeAnalysis.find(t => t.includes('关键操作')) || "你是不是偷看了剧本？"} 这种收益率在人类历史上都罕见，建议直接向SEC自首。`;
        }
    }
    
    // One sentence summary
    const summary = `本金 ${INITIAL_CAPITAL} U -> 最终 ${finalEquity.toFixed(2)} U (${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%)`;

    onFinish({
        score: Math.round(Math.max(0, roi * 10)), 
        roi: roi.toFixed(2),
        totalPnL: netPnL.toFixed(2), // Use Net PnL
        maxDrawdown: (maxDrawdown * 100).toFixed(2),
        totalTrades,
        totalFees: totalFees.toFixed(1), // Add to result
        hodlRoi: hodlRoi.toFixed(2),
        persona,
        roast,
        summary,
        history: allData
    });
  };

  const setBuyAmountPercentage = (percent) => {
      // Max buy logic: Amount + Fee (0.1%) <= Balance
      // Amount * 1.001 <= Balance  =>  Amount <= Balance / 1.001
      if (percent === 100) {
          const maxAmount = balance / 1.001;
          setBuyAmount(Math.floor(maxAmount * 100) / 100); // Floor to 2 decimals
      } else {
          setBuyAmount(Math.floor((balance * (percent / 100)) * 100) / 100);
      }
  };

  const handleBuyClick = () => {
    if (balance <= 1) return;
    setIsPaused(true);
    setIsBuyModalOpen(true);
    setBuyAmount(''); // Reset or keep previous? Reset is safer
  };

  const handleConfirmBuy = (amount) => {
    const amountToBuy = parseFloat(amount);
    
    // Fee is 0.1%
    if (!amountToBuy || amountToBuy <= 0 || amountToBuy * 1.001 > balance) {
         setToastMsg({ type: 'error', text: '💸 余额不足或金额无效' });
         return;
    }

    // Execute Trade Immediately
    const currentIdx = Math.floor(currentIndex); // Use state directly as we are paused
    const tradeData = allData[currentIdx];
    const executionPrice = tradeData.price; // No slippage/delay for modal buy? Or keep it? Let's keep it simple for now as requested: "Click confirm -> Deduct -> Resume"
    
    // Fee logic
    const fee = amountToBuy * 0.001;
    const quantity = amountToBuy / executionPrice;

    setBalance(prev => prev - amountToBuy - fee);
    setShares(prev => prev + quantity);
    setAvgPrice(prev => {
         const oldCost = prev * shares; // shares is from state closure? Need ref or prev? 
         // Inside setAvgPrice, prev is old avgPrice. But we need current shares.
         // Better to use functional update for everything or just rely on state if paused.
         // Since we are paused, state should be stable.
         return (oldCost + amountToBuy + fee) / (shares + quantity);
    });
    setTotalFees(prev => prev + fee);
    
    setTradeHistory(prev => [{
        id: Date.now(),
        type: 'BUY',
        price: executionPrice,
        amount: amountToBuy,
        fee: fee,
        quantity: quantity,
        time: tradeData.displayTime || '00:00:00',
        index: currentIdx
    }, ...prev]);
    
    setToastMsg({ type: 'success', text: `✅ 买入成功 @ $${executionPrice.toFixed(2)}` });

    setIsBuyModalOpen(false);
    setIsPaused(false);
  };

  const handleCancelBuy = () => {
      setIsBuyModalOpen(false);
      setIsPaused(false);
  };
  
  // Old handleBuy replaced by modal logic
  /* const handleBuy = () => { ... } */

  const executeSell = (isForced = false) => {
      try {
          const currentIdx = currentIndexRef.current;
          const currentData = allDataRef.current;
          const currentShares = sharesRef.current;
          
          // Use floor for data access, but we can use currentPrice state if we had access.
          // Since this is called from setTimeout, we might not have fresh state closure, 
          // but we have refs.
          // However, currentPrice is not in a ref. 
          // Let's recalculate price from currentIdx (float) using currentData.
          
          if (!currentData || currentShares <= 0) return;
          
          const floor = Math.floor(currentIdx);
          const tradeData = currentData[floor];
          
          if (!tradeData) return;

          // Calculate interpolated price
          let realPrice = tradeData.price;
          const ceil = Math.min(currentData.length - 1, floor + 1);
          const fraction = currentIdx - floor;
          const p2 = currentData[ceil];
          if (p2) {
              realPrice = realPrice + (p2.price - realPrice) * fraction;
          }
          
          // Use real price without penalty
          let executionPrice = realPrice;
          if (executionPrice < 0.01) executionPrice = 0.01;

          const sellValue = currentShares * executionPrice;
          const fee = sellValue * 0.001; // 0.1% Fee
          
          setBalance(prev => prev + sellValue - fee);
          setShares(0);
          setAvgPrice(0);
          setTotalFees(prev => prev + fee);

          setTradeHistory(prev => [{
              id: Date.now(),
              type: 'SELL',
              price: executionPrice,
              amount: sellValue,
              fee: fee,
              quantity: currentShares,
              time: tradeData.displayTime || '00:00:00',
              index: currentIdx
          }, ...prev]);
          
          if (isForced) {
             setToastMsg({ type: 'success', text: `⚡ 强制平仓成功 @ $${executionPrice.toFixed(2)}` });
          } else {
             setToastMsg({ type: 'success', text: `✅ 卖出成功 @ $${executionPrice.toFixed(2)}` });
          }
      } catch (error) {
          console.error("Sell execution error:", error);
          setToastMsg({ type: 'error', text: '❌ 交易执行出错' });
      } finally {
          setIsPendingOrder(false);
          sellTimeoutRef.current = null;
      }
  };

  const handleSell = (force = false) => {
      if (!force && isPendingOrder) return;
      if (shares <= 0) return;
      
      // Cooldown Check (10s)
      if (!force) {
          const timeSinceBuy = Date.now() - lastBuyTime;
          if (timeSinceBuy < 10000) {
              const remaining = Math.ceil((10000 - timeSinceBuy) / 1000);
              setToastMsg({ type: 'error', text: `🧊 持仓冷却中，请等待 ${remaining} 秒` });
              return;
          }
      }

      if (force) {
          // Synchronous/Immediate execution
          executeSell(true);
          return;
      }

      setToastMsg({ type: 'warning', text: '📡 正在发送卖单 (延迟 2000ms)...' });
      setIsPendingOrder(true);

      sellTimeoutRef.current = setTimeout(() => {
          executeSell(false);
      }, 2000);
  };

  const getStageLabel = () => {
      if (progress < 60) return "风暴前夕 (Pre-Event)";
      if (progress < 75) return "剧烈波动 (High Volatility)";
      return "余波震荡 (Aftermath)";
  };

  const handleEarlyExit = () => {
      // Cancel any pending orders immediately
      if (buyTimeoutRef.current) {
          clearTimeout(buyTimeoutRef.current);
          buyTimeoutRef.current = null;
      }
      if (sellTimeoutRef.current) {
          clearTimeout(sellTimeoutRef.current);
          sellTimeoutRef.current = null;
      }
      setIsPendingOrder(false); // Reset UI state

      setIsFinishing(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-500 font-mono">正在初始化数据链路...</div>;

  return (
    <div className={`app-container`}>
      {isScanning && (
          <div className="fixed inset-0 bg-black/80 z-[2000] flex flex-col items-center justify-center font-mono backdrop-blur-sm">
              <Scan size={64} className="text-blue-500 animate-spin-slow mb-6" />
              <div className="text-2xl font-bold text-blue-400 mb-2 animate-pulse">
                  正在扫描链上数据...
              </div>
              <div className="text-sm text-gray-500 tracking-widest uppercase">
                  Searching for High Volatility Events
              </div>
              <div className="w-64 h-1 bg-gray-800 rounded-full mt-8 overflow-hidden">
                  <div className="h-full bg-blue-500 animate-progress-indeterminate"></div>
              </div>
          </div>
      )}
      
      {isSkipping && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-1 rounded-full text-[10px] uppercase tracking-widest backdrop-blur-sm z-[900] flex items-center gap-2 animate-pulse">
             <Activity size={10} className="animate-spin" /> 正在加速跳过平淡期...
         </div>
      )}
      {toastMsg && (
         <div className={`absolute top-16 left-1/2 -translate-x-1/2 px-6 py-2 rounded shadow-lg backdrop-blur-md z-[950] font-bold border flex items-center gap-2 animate-bounce-in ${
             toastMsg.type === 'error' 
             ? 'bg-red-900/80 border-red-500 text-red-200' 
             : 'bg-yellow-900/80 border-yellow-500 text-yellow-200'
         }`}>
             <span>{toastMsg.text}</span>
         </div>
      )}
      {/* Start Simulation Overlay */}
      {!hasStarted && !loading && allData.length > 0 && (
          <div className="absolute inset-0 z-[2000] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
              <div className="bg-[#111] border border-[#333] p-10 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.2)] text-center max-w-lg mx-4">
                  <Activity className="w-16 h-16 text-blue-500 mx-auto mb-6 animate-pulse" />
                  
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-wider">
                      准备就绪
                  </h2>
                  <p className="text-gray-400 mb-8 font-mono text-sm">
                      SYSTEM READY // AWAITING COMMAND
                  </p>
                  
                  <div className="space-y-4">
                      <p className="text-gray-300 text-sm leading-relaxed mb-8">
                          你即将进入 2024 年 7 月 13 日的历史回测场景。<br/>
                          市场波动极其剧烈，请时刻关注左侧情报流与价格变化。<br/>
                          <span className="text-blue-400 font-bold">目标：捕捉 Alpha，存活下来。</span>
                      </p>
                      
                      <button 
                          onClick={() => setHasStarted(true)}
                          className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl tracking-[0.2em] uppercase rounded shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:shadow-[0_0_50px_rgba(37,99,235,0.8)] transition-all active:scale-95"
                      >
                          开始模拟
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="dashboard-card">
        
        {/* Main Panel: Chart & Controls */}
        <div className="main-panel">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-4">
                    <h1 className={blindMode ? 'blur-sm select-none' : ''}>
                        {blindMode ? '绝密行动' : '2024 美国总统大选预测'}
                    </h1>
                    
                    {/* Speed Controls */}
                    <div className="flex bg-gray-800/50 rounded-lg p-1 border border-white/10 gap-1">
                        {[1, 2, 4].map(m => (
                            <button
                                key={m}
                                onClick={() => setUserSpeedMultiplier(m)}
                                className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition-all ${
                                    userSpeedMultiplier === m 
                                    ? 'bg-blue-500 text-black shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                                title={`Speed ${m}x`}
                            >
                                {m}x
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="flex flex-col items-end w-1/3">
                    <div className="flex justify-between w-full text-[10px] text-gray-500 mb-1 uppercase tracking-wider">
                        <span>回测进度</span>
                        <span className={isVolatile ? 'text-neon-red animate-pulse' : 'text-blue-400'}>
                            {getStageLabel()}
                        </span>
                    </div>
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 ${isVolatile ? 'bg-neon-red' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            
            <div className="chart-container">
                {allData && allData.length > 0 ? (
                    <PriceChart data={allData} currentIndex={currentIndex}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis 
                            dataKey="simTime" 
                            stroke="#666" 
                            tickCount={5} 
                            tick={{fontSize: 10}}
                            type="number"
                            domain={[0, Math.max(1, allData.length - 1)]}
                            allowDataOverflow={true}
                        />
                        {tradeHistory.map(trade => (
                            <ReferenceDot
                                key={trade.id}
                                x={trade.index}
                                y={trade.price}
                                r={4}
                                fill={trade.type === 'BUY' ? '#00ff9d' : '#ff003c'}
                                stroke="none"
                                label={{ 
                                    position: 'top', 
                                    value: trade.type === 'BUY' ? 'B' : 'S', 
                                    fill: trade.type === 'BUY' ? '#00ff9d' : '#ff003c', 
                                    fontSize: 10, 
                                    fontWeight: 'bold' 
                                }}
                            />
                        ))}
                    </PriceChart>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 font-mono">
                        暂无数据 (No Data Available)
                    </div>
                )}
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
                {/* Buy/Sell Buttons */}
                <div className="flex gap-4 h-12">
                    <button 
                        className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed font-bold tracking-widest uppercase text-sm" 
                        onClick={handleBuyClick}
                        disabled={balance <= 1 || isPendingOrder}
                    >
                        <TrendingUp size={16} /> {isPendingOrder ? '处理中...' : '买入 (BUY)'}
                    </button>
                    <button 
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed font-bold tracking-widest uppercase text-sm" 
                        onClick={handleSell} 
                        disabled={shares <= 0 || isPendingOrder}
                    >
                        <TrendingDown size={16} /> {isPendingOrder ? '处理中...' : '卖出 (ALL)'}
                    </button>
                </div>
            </div>
            
            {/* Buy Modal */}
            {isBuyModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scale-up">
                         {/* Close Button */}
                         <button 
                             onClick={handleCancelBuy}
                             className="absolute top-4 right-4 text-gray-500 hover:text-white"
                         >
                             ✕
                         </button>
                         
                         <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                             <TrendingUp className="text-green-400" /> 买入 YES
                         </h2>
                         
                         {/* Current Price */}
                         <div className="mb-6 flex justify-between items-center bg-white/5 p-4 rounded-lg">
                             <span className="text-gray-400">当前价格 (Current Price)</span>
                             <span className="text-2xl font-mono font-bold text-green-400">
                                 ${currentPrice.toFixed(2)}
                             </span>
                         </div>
                         
                         {/* Input Area */}
                         <div className="mb-6 space-y-2">
                             <label className="text-xs text-gray-500 uppercase tracking-widest">买入金额 (USDC)</label>
                             <div className="relative">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                 <input 
                                     type="number" 
                                     value={buyAmount}
                                     onChange={(e) => setBuyAmount(e.target.value)}
                                     placeholder="0.00"
                                     autoFocus
                                     className="w-full bg-black border border-[#333] rounded-lg py-3 pl-8 pr-4 text-white font-mono text-lg focus:border-green-500 focus:outline-none transition-colors"
                                 />
                             </div>
                             <div className="flex justify-between text-xs mt-1">
                                <span className="text-gray-500">可用余额: ${balance.toFixed(2)}</span>
                                <span className={`${parseFloat(buyAmount) * 1.001 > balance ? 'text-red-500' : 'text-gray-600'}`}>
                                    预计费用: ${(parseFloat(buyAmount || 0) * 0.001).toFixed(2)} (0.1%)
                                </span>
                            </div>
                        </div>
                        
                        {/* Quick Percentages */}
                        <div className="grid grid-cols-4 gap-2 mb-8">
                            {[25, 50, 75, 100].map(p => (
                                <button
                                    key={p}
                                    onClick={() => {
                                        const maxAmt = balance / 1.001;
                                        // Use floor to avoid rounding up which would exceed balance
                                        const safeAmount = Math.floor(maxAmt * (p / 100) * 100) / 100;
                                        setBuyAmount(safeAmount.toFixed(2));
                                    }}
                                     className="py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-bold rounded border border-gray-700 transition-colors"
                                 >
                                     {p === 100 ? 'MAX' : `${p}%`}
                                 </button>
                             ))}
                         </div>
                         
                         {/* Action Buttons */}
                         <div className="flex gap-4">
                             <button 
                                 onClick={handleCancelBuy}
                                 className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-bold transition-colors"
                             >
                                 取消
                             </button>
                             <button 
                                onClick={() => handleConfirmBuy(buyAmount)}
                                disabled={!buyAmount || parseFloat(buyAmount) <= 0 || parseFloat(buyAmount) * 1.001 > balance}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:bg-green-900/50 disabled:text-gray-500 text-white rounded-lg font-bold transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:shadow-none"
                            >
                                 确认买入
                             </button>
                         </div>
                    </div>
                </div>
            )}
            
            {/* Early Exit Button */}
            <button 
                onClick={handleEarlyExit}
                className="w-full mt-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded py-2 flex items-center justify-center gap-2 transition-all active:scale-95 font-bold tracking-widest uppercase text-xs"
            >
                <LogOut size={14} /> 立即锁定收益并复盘
            </button>
        </div>

        {/* Side Panel: News Feed & Trade Log */}
        <div className="side-panel flex flex-col gap-4">
            {/* Professional Asset Dashboard */}
            <div className="asset-dashboard bg-[#111] border border-[#333] rounded-lg p-4 shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Trophy size={12} className="text-yellow-500"/> 资产看板 (Portfolio)
                </h3>
                
                <div className="space-y-3 font-mono">
                    {/* Balance */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-400">💰 当前余额</span>
                        <span className="text-sm font-bold text-white">{balance.toFixed(2)} USDC</span>
                    </div>

                    {/* Holdings */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-400">📈 持有份额</span>
                        <span className="text-sm font-bold text-blue-400">{shares.toFixed(0)} YES</span>
                    </div>

                    {/* Avg Price */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-400">⚖️ 持仓均价</span>
                        <span className="text-sm text-gray-300">${avgPrice.toFixed(2)}</span>
                    </div>

                    {/* PnL */}
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-xs text-gray-400">💎 浮动盈亏</span>
                        <span className={`text-lg font-bold ${pnlPercent >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                            {pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="news-feed h-[500px] flex flex-col shrink-0">
                <div className="news-header shrink-0">
                    <Newspaper size={14} /> 实时情报
                </div>
                <div className="news-list overflow-y-auto flex-1 px-1" ref={newsListRef}>
                    {newsFeed.map(item => (
                        <div key={item.id} className={`mb-3 pb-2 border-b border-white/5 last:border-0 ${item.type === 'real' ? 'animate-pulse' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] text-gray-600 font-mono">{item.time}</span>
                                {item.type === 'real' && (
                                    <span className="text-[9px] bg-red-500/20 text-red-500 px-1 rounded font-bold tracking-wider animate-pulse">
                                        SIGNAL
                                    </span>
                                )}
                            </div>
                            <p className={`leading-relaxed transition-all duration-300 ${
                                item.type === 'real' ? 'text-sm text-red-400 font-bold shadow-red-glow' : 
                                item.type === 'noise' ? 'text-[10px] text-gray-600' : 
                                'text-xs text-gray-300'
                            }`}>
                                {blindMode ? '*****************' : item.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Trade History */}
            <div className="trade-log h-1/3 border-t border-white/10 pt-2 flex flex-col shrink-0">
                 <div className="text-[10px] text-gray-500 mb-2 flex items-center gap-2 uppercase tracking-wider font-bold">
                    <Clock size={10}/> 交易记录
                 </div>
                 <div className="overflow-y-auto flex-1 space-y-1 pr-1 custom-scrollbar">
                     {tradeHistory.length === 0 && <div className="text-gray-600 text-[10px] text-center italic mt-4">暂无交易</div>}
                     {tradeHistory.map(trade => (
                         <div key={trade.id} className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-1 hover:bg-white/5 px-1 rounded">
                             <span className={`font-bold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                {trade.type === 'BUY' ? 'BUY' : 'SELL'}
                             </span>
                             <span className="text-gray-300">${trade.price.toFixed(2)}</span>
                             <span className="text-gray-500 text-[9px]">{trade.time}</span>
                         </div>
                     ))}
                 </div>
            </div>
        </div>

      </div>



    </div>
  );
};

const Result = ({ result, onRestart }) => {
  if (!result) return null;

  const roiVal = parseFloat(result.roi);
  const isProfitable = roiVal > 0;
  
  // Safe persona parsing
  let personaTitle = "Unknown";
  let personaSubtitle = "Unknown";
  
  if (result.persona) {
      if (result.persona.includes('(')) {
          const parts = result.persona.split('(');
          personaTitle = parts[0].trim();
          personaSubtitle = parts[1].replace(')', '').trim();
      } else {
          personaTitle = result.persona;
      }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000_100%)]"></div>
      
      {/* Performance Card */}
      <div className="performance-card relative z-10 max-w-md w-full bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
        {/* Header Gradient */}
        <div className={`h-2 w-full ${isProfitable ? 'bg-gradient-to-r from-neon-green to-blue-500' : 'bg-gradient-to-r from-neon-red to-orange-500'}`}></div>
        
        <div className="p-8 flex flex-col items-center">
            {/* Persona Badge */}
            <div className="mb-6">
                <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border ${
                    isProfitable 
                    ? 'border-neon-green text-neon-green bg-neon-green/10' 
                    : 'border-neon-red text-neon-red bg-neon-red/10'
                }`}>
                    {isProfitable ? '盈利 (PROFITABLE)' : '亏损 (LIQUIDATED)'}
                </span>
            </div>

            <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tight">
                {personaTitle}
            </h1>
            <p className="text-sm text-gray-500 mb-8 font-mono">{personaSubtitle}</p>

            {/* 1. Summary Metrics */}
            <div className="grid grid-cols-3 gap-2 w-full mb-6">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col items-center">
                    <span className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">总盈亏 (PnL)</span>
                    <span className={`text-lg font-bold font-mono ${parseFloat(result.totalPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(result.totalPnL) >= 0 ? '+' : ''}{result.totalPnL}
                    </span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col items-center">
                    <span className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">最高回撤</span>
                    <span className="text-lg font-bold font-mono text-gray-300">
                        -{result.maxDrawdown}%
                    </span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col items-center">
                    <span className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">交易次数</span>
                    <span className="text-lg font-bold font-mono text-blue-400">
                        {result.totalTrades}
                    </span>
                </div>
            </div>

            {/* 2. Benchmark Comparison */}
            <div className="w-full bg-white/5 rounded-lg p-4 border border-white/5 mb-6">
                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 text-center">策略表现对比 (Strategy Benchmark)</h4>
                
                {/* You */}
                <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-white font-bold">你的表现 (Active)</span>
                        <span className={`font-mono ${roiVal >= 0 ? 'text-green-400' : 'text-red-400'}`}>{result.roi}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative">
                         <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20 z-10"></div>
                         <div 
                            className={`h-full absolute top-0 bottom-0 ${roiVal >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ 
                                left: roiVal >= 0 ? '50%' : `${50 + (roiVal > -100 ? roiVal/2 : -50)}%`, 
                                width: `${Math.min(Math.abs(roiVal)/2, 50)}%`
                            }} 
                         ></div>
                    </div>
                </div>

                {/* Hodl */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">躺平表现 (Hodl)</span>
                        <span className={`font-mono ${parseFloat(result.hodlRoi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{result.hodlRoi}%</span>
                    </div>
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${parseFloat(result.hodlRoi) >= 0 ? 'bg-gray-500' : 'bg-red-900'}`}
                            style={{ width: `${Math.min(Math.abs(parseFloat(result.hodlRoi)), 100)}%` }} 
                        ></div>
                    </div>
                </div>
            </div>

            {/* AI Roast */}
            <div className="ai-roast w-full bg-[#111] p-4 rounded-xl border border-dashed border-[#333] mb-8 relative">
                <div className="absolute -top-3 left-4 bg-[#0a0a0a] px-2 text-xs text-purple-500 font-bold flex items-center gap-1">
                     AI 深度评价
                </div>
                <div className="text-center space-y-2">
                    <p className="text-white text-sm font-bold">
                        "{result.summary}"
                    </p>
                    <p className="text-gray-400 text-xs italic leading-relaxed border-t border-gray-800 pt-2 mt-2">
                        "{result.roast}"
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full flex items-center justify-between border-t border-white/10 pt-6">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">PolyChronos 聚时</span>
                    <span className="text-[10px] text-gray-600">生成于 {new Date().toLocaleDateString()}</span>
                </div>
                <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-black border-dashed opacity-50"></div>
                </div>
            </div>
        </div>

        {/* Restart Button */}
        <button 
            onClick={onRestart}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold tracking-widest text-xs uppercase transition-colors border-t border-white/5"
        >
            再来一局
        </button>
      </div>
    </div>
  );
};

// --- Main App ---
function App() {
  const [appMode, setAppMode] = useState('lobby'); // lobby, loading, sim, result
  const [loadingState, setLoadingState] = useState('idle'); // idle, fetching, ready
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [simulationData, setSimulationData] = useState([]);
  const [blindMode, setBlindMode] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleSelectScenario = async (scenario) => {
    setSelectedScenario(scenario);
    
    // 1. Check Cache
    const cacheKey = `poly_cache_${scenario.slug}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        console.log("⚡ Cache Hit! Instant Load.");
        try {
            const data = JSON.parse(cached);
            if (Array.isArray(data) && data.length > 0) {
                 setSimulationData(data);
                 setAppMode('sim');
                 return;
            } else {
                console.warn("Invalid cached data");
                localStorage.removeItem(cacheKey);
            }
        } catch (e) {
            console.error("Cache parse error", e);
            localStorage.removeItem(cacheKey);
        }
    }

    // 2. Fetch if miss
    setAppMode('loading');
    setLoadingState('fetching');
    
    try {
        // Artificial delay for "Cool Animation" (at least 1.5s)
        const startTime = Date.now();
        
        const response = await axios.get(`http://localhost:3001/api/trades/${scenario.slug}`);
        const cleanData = processTradeData(response.data);
        
        // Calculate remaining time to satisfy min duration
        const elapsed = Date.now() - startTime;
        const minDuration = 1500;
        if (elapsed < minDuration) {
            await new Promise(r => setTimeout(r, minDuration - elapsed));
        }

        setSimulationData(cleanData);
        setLoadingState('ready');
        
        // Cache it
        try {
            localStorage.setItem(cacheKey, JSON.stringify(cleanData));
        } catch (e) {
            console.warn("Storage full or error", e);
        }

    } catch (error) {
        console.error("Load failed", error);
        setAppMode('lobby'); // Go back on error
        alert("Failed to load scenario data");
    }
  };
  
  const handleEnterSim = () => {
      setAppMode('sim');
      setLoadingState('idle');
  };

  const handleSimulationFinish = (data) => {
    setResultData(data);
    setTimeout(() => {
        setAppMode('result');
    }, 1000);
  };

  const handleRestart = () => {
    setAppMode('lobby');
    setResultData(null);
    setSelectedScenario(null);
  };

  return (
    <>
      {appMode === 'lobby' && (
        <Lobby 
            onSelect={handleSelectScenario} 
            blindMode={blindMode} 
            setBlindMode={setBlindMode} 
        />
      )}
      
      {appMode === 'loading' && (
          <LoadingScreen 
              status={loadingState} 
              onEnter={handleEnterSim} 
          />
      )}

      {appMode === 'sim' && selectedScenario && (
        <Simulation 
            slug={selectedScenario.slug} 
            blindMode={blindMode}
            onFinish={handleSimulationFinish}
            preloadedData={simulationData}
        />
      )}
      {appMode === 'result' && resultData && (
        <Result 
            result={resultData} 
            onRestart={handleRestart} 
        />
      )}
    </>
  );
}

export default App;
