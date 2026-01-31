import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Clock, ArrowRight, Activity, TrendingUp, TrendingDown, 
  DollarSign, Zap, Play, AlertTriangle, Radio, Gauge, RotateCcw, LogOut
} from 'lucide-react';
import PriceChart from './PriceChart';
import { SCENARIOS, TRUMP_SCRIPT, CRYPTO_NOISE } from '../constants/scenarios';
import axios from 'axios';
import { cn } from '../lib/utils';

// --- Animated Background (CSS Version) ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    {/* Deep cosmic gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1040] to-[#0a0a1a]" />
    
    {/* Aurora glows */}
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00d4ff] rounded-full blur-[150px] opacity-20 animate-pulse" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff66cc] rounded-full blur-[150px] opacity-15 animate-pulse" style={{ animationDelay: '2s' }} />
    
    {/* Stars (Static for performance, could be animated via CSS) */}
    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
  </div>
);

// --- Glass Card ---
const GlassCard = ({ children, className = '', variant = 'default', onClick }) => {
  const variants = {
    default: 'bg-[#140a28]/70 border-[#6450c8]/30 shadow-lg shadow-purple-900/20',
    gold: 'bg-gradient-to-br from-[#1a1040]/80 to-[#140a28]/70 border-[#ffd700]/30 shadow-lg shadow-amber-900/20',
    cyan: 'bg-gradient-to-br from-[#0a1a2a]/80 to-[#140a28]/70 border-[#00d4ff]/30 shadow-lg shadow-cyan-900/20',
    danger: 'bg-gradient-to-br from-[#2a0a1a]/80 to-[#140a28]/70 border-[#ff4466]/30 shadow-lg shadow-red-900/20',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative backdrop-blur-xl border rounded-2xl transition-all duration-300",
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </div>
  );
};

// --- Price Display ---
const PriceDisplay = ({ price, isVolatile }) => (
  <div className={cn(
    "text-6xl font-serif font-bold tracking-tight transition-all duration-200",
    isVolatile ? 'text-[#ff4466]' : 'text-[#00d4ff]'
  )}
  style={{
    textShadow: isVolatile 
      ? '0 0 20px rgba(255,68,102,0.6)' 
      : '0 0 20px rgba(0,212,255,0.6)'
  }}>
    ${price.toFixed(2)}
  </div>
);

// --- Main Component ---
const TradingTerminal = ({ slug, blindMode, onFinish, preloadedData }) => {
  // State from App.jsx Logic
  const [allData, setAllData] = useState(preloadedData?.length ? preloadedData : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!preloadedData?.length);
  const [priceFlash, setPriceFlash] = useState(false);
  const [speed, setSpeed] = useState(60); // ms per tick
  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [userSpeedMultiplier, setUserSpeedMultiplier] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [isVolatile, setIsVolatile] = useState(false);
  const [newsFeed, setNewsFeed] = useState([]);
  
  // Asset Management (Core Logic)
  const [balance, setBalance] = useState(100000); // 100k USDT
  const [shares, setShares] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [totalFees, setTotalFees] = useState(0);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const volatilityTimeoutRef = useRef(null);
  const triggeredScriptIds = useRef(new Set());
  const eventTriggerIndexRef = useRef(null);
  const newsListRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Derived State
  const currentPrice = useMemo(() => {
    if (!allData || allData.length === 0) return 0.50;
    const floorIndex = Math.floor(currentIndex);
    const fraction = currentIndex - floorIndex;
    if (floorIndex < 0) return allData[0].price;
    if (floorIndex >= allData.length - 1) return allData[allData.length - 1].price;
    
    const p1 = allData[floorIndex].price;
    const p2 = allData[floorIndex + 1]?.price ?? p1;
    return p1 + (p2 - p1) * fraction;
  }, [currentIndex, allData]);

  const equity = balance + (shares * currentPrice);
  const pnlPercent = ((equity - 100000) / 100000) * 100;
  const pnlValue = equity - 100000;

  // Chart Data
  const visibleData = useMemo(() => {
    const endIdx = Math.floor(currentIndex) + 1;
    const startIdx = Math.max(0, endIdx - 100);
    return allData.slice(startIdx, endIdx);
  }, [allData, currentIndex]);

  // --- Effects (Logic Ported from App.jsx) ---

  // 1. Fetch Data
  useEffect(() => {
    if (preloadedData?.length) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // Note: Ideally use localhost:3001 in dev, but relative path for prod?
        // Keeping logic from App.jsx
        const response = await axios.get(`http://localhost:3001/api/trades/${slug}`);
        const rawData = response.data;

        const cleanData = rawData.map((trade, index) => {
          let price = trade.price;
          if (price > 1) price = price / 100;
          if (price > 0.99) price = 0.99;
          if (price < 0.01) price = 0.01;
          
          return {
            ...trade,
            price,
            size: trade.size || 0,
            simTime: index,
            displayTime: new Date(trade.time * 1000).toLocaleTimeString()
          };
        });

        setAllData(cleanData);
        setLoading(false);

        // Volatility Skip Logic (Simplified)
        if (cleanData.length > 100) {
            const first100 = cleanData.slice(0, 100);
            const minP = Math.min(...first100.map(d => d.price));
            const maxP = Math.max(...first100.map(d => d.price));
            if ((maxP - minP) / minP < 0.01) {
                // Low volatility, skip ahead logic here if needed
            }
        }
      } catch (error) {
        console.error("Error fetching trades:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, preloadedData]);

  // 2. Simulation Loop
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

            const increment = (delta / speed) * userSpeedMultiplier;

            setCurrentIndex(prevIndex => {
                const nextIndex = prevIndex + increment;
                
                if (nextIndex >= allData.length - 1) {
                    setIsFinishing(true); // Stop the loop
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

  // 3. Game Logic (News, Triggers)
  useEffect(() => {
      const index = Math.floor(currentIndex);
      if (index < 0 || !allData[index]) return;

      const currentTrade = allData[index];
      const newProgress = (index / (allData.length - 1)) * 100;
      setProgress(newProgress);

      // Block-based triggers
      if (currentTrade.blockNumber) {
          const matchingEvents = TRUMP_SCRIPT.filter(event => 
              event.block && 
              event.block <= currentTrade.blockNumber && 
              !triggeredScriptIds.current.has(event.id)
          );
          
          matchingEvents.forEach(event => {
              triggeredScriptIds.current.add(event.id);
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
                  if (eventTriggerIndexRef.current === null) {
                      eventTriggerIndexRef.current = index;
                  }
              }
          });
      }

      // Progress triggers
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

      // Noise
      if (Math.random() < 0.05) {
           // Simplified noise generation
      }

  }, [Math.floor(currentIndex), allData]);

  // 4. Volatility Check
  useEffect(() => {
    if (currentIndex < 30 || !allData[Math.floor(currentIndex)]) return;
    const idx = Math.floor(currentIndex);
    const currentTrade = allData[idx];
    const pastTrade = allData[idx - 5];

    if (currentTrade && pastTrade && pastTrade.price > 0) {
        const priceChange = Math.abs((currentTrade.price - pastTrade.price) / pastTrade.price);
        if (priceChange > 0.10) {
            setIsVolatile(true);
            if (volatilityTimeoutRef.current) clearTimeout(volatilityTimeoutRef.current);
            volatilityTimeoutRef.current = setTimeout(() => {
                setIsVolatile(false);
            }, 3000);
        }
    }
  }, [currentIndex, allData]);

  // Auto-scroll News
  useEffect(() => {
    if (newsListRef.current) {
        newsListRef.current.scrollTop = 0;
    }
  }, [newsFeed]);

  // Toast Timer
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);


  // --- Actions ---

  const handleBuyClick = () => {
    if (balance <= 1) return;
    setIsPaused(true);
    setIsBuyModalOpen(true);
    setBuyAmount('');
  };

  const handleConfirmBuy = (amountStr) => {
    const amount = parseFloat(amountStr);
    
    if (!amount || amount <= 0 || amount * 1.001 > balance) {
         setToastMsg({ type: 'error', text: '💸 余额不足或金额无效' });
         return;
    }

    const currentIdx = Math.floor(currentIndex);
    const tradeData = allData[currentIdx];
    const executionPrice = tradeData.price;
    
    // Fee logic (0.1%)
    const fee = amount * 0.001;
    const quantity = amount / executionPrice;

    setBalance(prev => prev - amount - fee);
    setShares(prev => prev + quantity);
    setAvgPrice(prev => {
         const oldCost = prev * shares;
         return (oldCost + amount + fee) / (shares + quantity);
    });
    setTotalFees(prev => prev + fee);
    
    setTradeHistory(prev => [{
        id: Date.now(),
        type: 'BUY',
        price: executionPrice,
        amount: amount,
        fee: fee,
        quantity: quantity,
        time: tradeData.displayTime || '00:00:00',
        index: currentIdx
    }, ...prev]);
    
    setToastMsg({ type: 'success', text: `✅ 买入成功 @ $${executionPrice.toFixed(2)}` });

    setIsBuyModalOpen(false);
    setIsPaused(false);
  };

  const handleSell = (isForced = false) => {
      if (shares <= 0) return;

      const currentIdx = Math.floor(currentIndex);
      const tradeData = allData[currentIdx];
      const executionPrice = tradeData.price;

      const sellValue = shares * executionPrice;
      const fee = sellValue * 0.001; // 0.1% Fee
      const netReturn = sellValue - fee;

      setBalance(prev => prev + netReturn);
      setShares(0);
      setAvgPrice(0);
      setTotalFees(prev => prev + fee);

      setTradeHistory(prev => [{
          id: Date.now(),
          type: 'SELL',
          price: executionPrice,
          amount: netReturn,
          fee: fee,
          quantity: shares,
          time: tradeData.displayTime || '00:00:00',
          index: currentIdx
      }, ...prev]);

      setToastMsg({ type: 'success', text: `💰 卖出成功 +$${netReturn.toFixed(2)}` });
  };

  const handleSettle = () => {
      setIsFinishing(true);

      let finalBalance = balance;
      let finalFees = totalFees;
      
      if (shares > 0) {
          const currentIdx = Math.floor(currentIndex);
          const tradeData = allData[currentIdx] || allData[allData.length - 1];
          const price = tradeData.price;
          
          const sellValue = shares * price;
          const fee = sellValue * 0.001;
          const netReturn = sellValue - fee;
          
          finalBalance += netReturn;
          finalFees += fee;
      }
      
      handleSimulationEnd(Math.floor(currentIndex), {
          balance: finalBalance,
          shares: 0,
          totalFees: finalFees
      });
  };

  const handleSimulationEnd = (finalIndex, overrideState = null) => {
    const finalPrice = allData[finalIndex].price;
    // Use override state if provided, otherwise use current state
    const currentBalance = overrideState ? overrideState.balance : balance;
    const currentShares = overrideState ? overrideState.shares : shares;
    const currentTotalFees = overrideState ? overrideState.totalFees : totalFees;

    const finalEquity = currentBalance + (currentShares * finalPrice);
    const INITIAL_CAPITAL = 100000;
    const totalPnL = finalEquity - INITIAL_CAPITAL;
    const roi = (totalPnL / INITIAL_CAPITAL) * 100;
    
    // --- 1. Hodl Strategy Calculation ---
    const initialPrice = allData[0].price;
    const hodlShares = INITIAL_CAPITAL / initialPrice;
    const hodlEquity = hodlShares * finalPrice;
    const hodlRoi = ((hodlEquity - INITIAL_CAPITAL) / INITIAL_CAPITAL) * 100;

    // --- 2. Max Drawdown Calculation ---
    let tempBalance = INITIAL_CAPITAL;
    let tempShares = 0;
    let peakEquity = INITIAL_CAPITAL;
    let maxDrawdown = 0;
    
    const tradesByIndex = {};
    tradeHistory.forEach(t => {
        if (!tradesByIndex[t.index]) tradesByIndex[t.index] = [];
        tradesByIndex[t.index].push(t);
    });

    for (let i = 0; i <= finalIndex; i++) {
        const p = allData[i].price;
        
        if (tradesByIndex[i]) {
            tradesByIndex[i].forEach(t => {
                if (t.type === 'BUY') {
                    tempBalance -= t.amount;
                    tempShares += t.quantity;
                } else {
                    tempBalance += t.amount;
                    tempShares -= t.quantity;
                }
            });
        }
        
        const currentEq = tempBalance + (tempShares * p);
        if (currentEq > peakEquity) peakEquity = currentEq;
        
        const dd = (peakEquity - currentEq) / peakEquity;
        if (dd > maxDrawdown) maxDrawdown = dd;
    }

    // --- 3. Persona & Roast Logic ---
    const totalTrades = tradeHistory.length;
    let persona = "";
    let roast = "";
    
    // Metrics
    const netPnL = totalPnL - currentTotalFees; 
    
    // Find key events
    const outbreakBlock = 59311100; 
    const outbreakIndex = allData.findIndex(d => (d.blockNumber || 0) >= outbreakBlock);
    
    let tradeAnalysis = [];
    
    const sortedTrades = [...tradeHistory].sort((a, b) => a.index - b.index);
    
    if (sortedTrades.length > 0) {
        sortedTrades.forEach((trade) => {
            const tradeTime = trade.index;
            const isBuy = trade.type === 'BUY';
            const price = trade.price;
            
            const distToOutbreak = tradeTime - outbreakIndex;
            
            if (outbreakIndex !== -1) {
                if (distToOutbreak >= -10 && distToOutbreak < 20) {
                    if (isBuy) {
                        tradeAnalysis.push(`✅ 关键操作：你在枪击案发生前后精准买入($${price.toFixed(2)})，抓住了黄金窗口。`);
                    } else {
                        tradeAnalysis.push(`❌ 致命失误：枪击案刚发生你就卖飞了($${price.toFixed(2)})，将暴富机会拱手让人。`);
                    }
                }
                else if (distToOutbreak >= 20 && distToOutbreak < 150) {
                     if (isBuy) {
                         if (price > 0.8) {
                             tradeAnalysis.push(`⚠️ 追高风险：价格已经飙升至 $${price.toFixed(2)}，你还在追涨，典型的FOMO心态。`);
                         } else {
                             tradeAnalysis.push(`✅ 顺势而为：趋势确立后果断上车($${price.toFixed(2)})，吃到了鱼身行情。`);
                         }
                     } else {
                         if (price > 0.85) {
                             tradeAnalysis.push(`✅ 逃顶大师：在 $${price.toFixed(2)} 高位精准止盈，落袋为安。`);
                         }
                     }
                }
            }
        });
    }

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
    
    const summary = `本金 ${INITIAL_CAPITAL} U -> 最终 ${finalEquity.toFixed(2)} U (${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%)`;

    onFinish({
        score: Math.round(Math.max(0, roi * 10)), 
        roi: roi.toFixed(2),
        totalPnL: netPnL.toFixed(2), 
        finalBalance: finalEquity,
        maxDrawdown: (maxDrawdown * 100).toFixed(2),
        totalTrades,
        totalFees: currentTotalFees.toFixed(1), 
        hodlRoi: hodlRoi.toFixed(2),
        persona,
        roast,
        summary,
        history: allData
    });
  };

  const setBuyAmountPercentage = (percent) => {
      if (percent === 100) {
          const maxAmount = balance / 1.001;
          setBuyAmount(Math.floor(maxAmount * 100) / 100); 
      } else {
          setBuyAmount(Math.floor((balance * (percent / 100)) * 100) / 100);
      }
  };

  // --- Render ---

  if (!hasStarted) {
      return (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center font-sans">
              <AnimatedBackground />
              <div className="z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                       <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00d4ff] border-r-[#ff66cc] animate-spin" />
                       <Clock className="w-16 h-16 text-[#ffd700]" />
                  </div>
                  <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold tracking-wide text-[#f0e6ff]">
                          {loading ? '时间回溯中...' : '准备就绪'}
                      </h2>
                      <p className="text-sm text-[#a0a0c0]">
                          {loading ? '正在同步历史数据...' : '穿越倒计时'}
                      </p>
                  </div>
                  {!loading && (
                      <button
                          onClick={() => { setHasStarted(true); }}
                          className="px-12 py-4 bg-gradient-to-r from-[#00d4ff] to-[#ff66cc] text-white font-bold tracking-wide rounded-xl shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform"
                      >
                          开启时空之旅
                      </button>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen font-sans overflow-hidden relative text-[#e0e0e0]">
      <AnimatedBackground />

      {/* Toast */}
      {toastMsg && (
        <div className={cn(
            "fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border animate-in fade-in slide-in-from-top-5",
            toastMsg.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-green-500/20 border-green-500/50 text-green-200'
        )}>
            {toastMsg.text}
        </div>
      )}

      {/* Buy Modal */}
      {isBuyModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <GlassCard className="w-96 p-6 space-y-6" variant="cyan">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#00d4ff]" />
                      买入 YES
                  </h3>
                  
                  <div className="space-y-4">
                      <div className="text-sm text-gray-400 flex justify-between">
                          <span>可用余额:</span>
                          <span className="text-[#00d4ff] font-mono">${balance.toFixed(2)}</span>
                      </div>
                      
                      <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input 
                              type="number" 
                              value={buyAmount}
                              onChange={(e) => setBuyAmount(e.target.value)}
                              className="w-full bg-[#0a1a2a] border border-[#00d4ff]/30 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-[#00d4ff]"
                              placeholder="输入金额..."
                              autoFocus
                          />
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                          {[25, 50, 75, 100].map(pct => (
                              <button 
                                  key={pct}
                                  onClick={() => setBuyAmountPercentage(pct)}
                                  className="text-xs py-1 rounded border border-[#00d4ff]/20 hover:bg-[#00d4ff]/10 text-[#00d4ff] transition-colors"
                              >
                                  {pct}%
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                      <button 
                          onClick={() => setIsBuyModalOpen(false)}
                          className="flex-1 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
                      >
                          取消
                      </button>
                      <button 
                          onClick={() => handleConfirmBuy(buyAmount)}
                          className="flex-1 py-3 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0099ff] text-white font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
                      >
                          确认买入
                      </button>
                  </div>
              </GlassCard>
          </div>
      )}

      {/* Main Layout: Split View */}
      <div className="flex w-full h-full relative z-0">
        
        {/* LEFT PANEL: Chart & Header (75%) */}
        <div className="flex-[3] flex flex-col border-r border-[#6450c8]/30 relative bg-[#0a0a1a]/20">
            {/* Header */}
            <header className="h-14 border-b border-[#6450c8]/30 flex items-center justify-between px-6 bg-[#140a28]/60 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", isVolatile ? 'bg-[#ff4466] animate-ping' : 'bg-[#00ff88]')} />
                        <h1 className="text-sm font-bold text-[#f0e6ff] flex items-center gap-2">
                            {SCENARIOS[0]?.title || 'Unknown Scenario'}
                            {blindMode && <span className="text-[10px] bg-[#ff4466]/20 text-[#ff4466] px-2 py-0.5 rounded-full border border-[#ff4466]/50">盲测</span>}
                        </h1>
                    </div>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-2 bg-[#0a0a1a]/40 p-1 rounded-lg border border-[#6450c8]/20">
                    <Clock size={14} className="text-[#a0a0c0] ml-2" />
                    {[1, 2, 5, 10].map(m => (
                        <button
                            key={m}
                            onClick={() => setUserSpeedMultiplier(m)}
                            className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold transition-colors min-w-[30px]",
                                userSpeedMultiplier === m 
                                ? 'bg-[#00d4ff] text-[#0a0a1a]' 
                                : 'text-[#a0a0c0] hover:text-white hover:bg-[#ffffff]/10'
                            )}
                        >
                            x{m}
                        </button>
                    ))}
                </div>
            </header>

            {/* Chart Container */}
            <div className="flex-1 relative flex flex-col overflow-hidden">
                <div className="absolute top-6 left-6 z-10 pointer-events-none">
                    <PriceDisplay price={currentPrice} isVolatile={isVolatile} />
                    <div className={cn("mt-1 text-sm font-medium flex items-center gap-2", isVolatile ? 'text-[#ff4466]' : 'text-[#00ff88]')}>
                        {isVolatile ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                        {isVolatile ? 'HIGH VOLATILITY DETECTED' : 'MARKET STABLE'}
                    </div>
                </div>
                
                <div className="flex-1">
                    <PriceChart 
                        data={visibleData} 
                        blindMode={blindMode} 
                        currentIndex={currentIndex}
                    />
                </div>
            </div>
        </div>

        {/* RIGHT PANEL: Stats, Controls, News (25%) */}
        <div className="flex-[1] min-w-[340px] flex flex-col bg-[#140a28]/40 backdrop-blur-md">
            
            {/* Top: Financial Stats */}
            <div className="p-6 space-y-4 border-b border-[#6450c8]/30 bg-[#0a0a1a]/40">
                <div className="flex items-center gap-2 text-[#00d4ff] mb-2">
                    <Gauge className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-widest uppercase">Portfolio</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-[10px] text-[#a0a0c0] uppercase tracking-wider">Total Equity</span>
                        <div className="text-2xl font-bold text-white font-mono">${equity.toFixed(2)}</div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-[#a0a0c0] uppercase tracking-wider">Balance</span>
                        <div className="text-xl font-bold text-[#a0a0c0] font-mono">${balance.toFixed(2)}</div>
                    </div>
                </div>

                <div className="pt-4 border-t border-[#ffffff]/5">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] text-[#a0a0c0] uppercase tracking-wider">Unrealized PnL</span>
                        <div className={cn("text-xl font-bold font-mono", pnlValue >= 0 ? 'text-[#00ff88]' : 'text-[#ff4466]')}>
                            {pnlValue >= 0 ? '+' : ''}{pnlValue.toFixed(2)} <span className="text-sm opacity-70">({pnlPercent.toFixed(2)}%)</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-[#a0a0c0] font-mono bg-[#0a0a1a] p-2 rounded border border-[#ffffff]/5">
                    <span>POS: {shares.toFixed(0)} YES</span>
                    <span>AVG: ${avgPrice.toFixed(2)}</span>
                </div>
            </div>

            {/* Middle: Controls */}
            <div className="p-4 grid grid-cols-2 gap-3 border-b border-[#6450c8]/30 bg-[#1a1040]/20">
                <button
                    onClick={handleBuyClick}
                    disabled={balance < 1}
                    className="py-3 bg-[#00ff88] hover:bg-[#00ff88]/80 text-[#0a0a1a] font-bold rounded-xl shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                >
                    <span className="text-sm">BUY YES</span>
                    <span className="text-[10px] opacity-70 font-mono">Max: ${(balance / currentPrice).toFixed(0)}</span>
                </button>
                <button
                    onClick={() => handleSell()}
                    disabled={shares <= 0}
                    className="py-3 bg-[#ff4466] hover:bg-[#ff4466]/80 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                >
                    <span className="text-sm">SELL YES</span>
                    <span className="text-[10px] opacity-70 font-mono">All: ${shares.toFixed(0)}</span>
                </button>
                
                <div className="col-span-2 flex gap-3 pt-2">
                     <button 
                        onClick={() => setIsPaused(!isPaused)}
                        className="flex-1 py-2 bg-[#ffffff]/5 hover:bg-[#ffffff]/10 border border-[#ffffff]/10 text-[#00d4ff] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                     >
                        {isPaused ? <Play size={14} /> : <div className="w-3 h-3 border-2 border-[#00d4ff] border-l-transparent rounded-full animate-spin" />}
                        {isPaused ? 'RESUME' : 'PAUSE'}
                     </button>
                     <button 
                        onClick={handleSettle}
                        className="flex-1 py-2 bg-[#ffd700]/10 hover:bg-[#ffd700]/20 border border-[#ffd700]/30 text-[#ffd700] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                     >
                        <LogOut size={14} /> 
                        立即结算
                     </button>
                </div>
            </div>

            {/* Bottom: News Feed */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a1a]/30">
                <div className="p-3 border-b border-[#6450c8]/20 flex items-center justify-between bg-[#140a28]/60">
                    <h3 className="text-xs font-bold text-[#a0a0c0] flex items-center gap-2 uppercase tracking-wider">
                        <Activity size={12} className="text-[#00d4ff]" />
                        Live Feed
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
                        <span className="text-[10px] text-[#00d4ff] font-mono">CONNECTED</span>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-[#6450c8]/30 scrollbar-track-transparent" ref={newsListRef}>
                    {newsFeed.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-[#a0a0c0]/40 text-xs gap-2">
                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#a0a0c0]/30 animate-spin-slow" />
                            <span>Scanning Chain Data...</span>
                        </div>
                    )}
                    {newsFeed.map((news) => (
                        <div 
                            key={news.id} 
                            className={cn(
                                "p-3 rounded-lg border text-xs animate-in slide-in-from-right-5 transition-all",
                                news.isReal 
                                ? 'bg-[#ff4466]/10 border-[#ff4466]/30 text-[#ffb3c1] shadow-[0_0_15px_rgba(255,68,102,0.1)]' 
                                : 'bg-[#140a28]/50 border-[#6450c8]/20 text-gray-300 hover:bg-[#140a28]/80'
                            )}
                        >
                            <div className="flex justify-between items-center mb-1 opacity-60 text-[10px] font-mono">
                                <span>{news.time}</span>
                                {news.isReal && <span className="text-[#ff4466] font-bold tracking-wider">BREAKING</span>}
                            </div>
                            <p className="leading-relaxed">{news.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TradingTerminal;