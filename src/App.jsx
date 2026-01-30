import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from 'recharts';
import axios from 'axios';
import { Scan, Activity, Trophy, ArrowRight, RotateCcw, Flag, Newspaper, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

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

const Simulation = ({ slug, blindMode, onFinish }) => {
  const [allData, setAllData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceFlash, setPriceFlash] = useState(false);
  
  // Volatility State
  const [isVolatile, setIsVolatile] = useState(false);
  const volatilityTimeoutRef = useRef(null);

  // AI News Generator State
  const [newsFeed, setNewsFeed] = useState([]);
  
  // User Interaction State
  const [userPosition, setUserPosition] = useState(null);
  const [balance, setBalance] = useState(1000); // Starting Virtual Balance
  const [pnlPercent, setPnlPercent] = useState(0);
  
  // Constants
  const SIGNAL_INDEX = 10; 
  const newsListRef = useRef(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/trades/${slug}`);
        const rawData = response.data;

        const cleanData = rawData.map((trade, index) => {
          let price = trade.price;
          if (price > 1) price = 0.99;
          
          return {
            ...trade,
            price,
            simTime: index,
            displayTime: new Date(trade.time * 1000).toLocaleTimeString()
          };
        });

        setAllData(cleanData);
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
    const pastTrade = allData[currentIndex - 30]; // 3 seconds ago (30 * 100ms)

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

  // Simulation Loop
  useEffect(() => {
    if (loading || allData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex >= allData.length - 1) {
          clearInterval(interval);
          handleSimulationEnd(prevIndex);
          return prevIndex;
        }

        const nextIndex = prevIndex + 1;
        const nextTrade = allData[nextIndex];
        const prevTrade = allData[prevIndex];

        setDisplayedData(prev => [...prev, nextTrade]);
        setCurrentPrice(nextTrade.price);

        // Flash logic
        if (prevTrade && prevTrade.price > 0) {
            const percentChange = Math.abs((nextTrade.price - prevTrade.price) / prevTrade.price);
            if (percentChange > 0.05) {
                setPriceFlash(true);
                setTimeout(() => setPriceFlash(false), 500);
            }
        }

        // News Logic
        let newNews = null;
        let isBreaking = false;
        if (nextIndex === SIGNAL_INDEX) { newNews = "突发：集会现场传出枪声！"; isBreaking = true; }
        else if (nextIndex === 25) { newNews = "最新：特朗普被护送离场，面部有血迹"; isBreaking = true; }
        else if (nextIndex === 45) { newNews = "数据：特朗普胜选赔率飙升"; isBreaking = false; }

        if (!newNews && prevTrade) {
            const priceDiff = Math.abs(nextTrade.price - prevTrade.price);
            if (priceDiff > 0.10) { newNews = "警告：检测到高波动率！巨鲸正在入场。"; isBreaking = true; }
        }

        if (newNews) {
            const newsItem = {
                id: Date.now(),
                time: `T+${nextIndex * 0.1}s`,
                content: newNews,
                breaking: isBreaking
            };
            setNewsFeed(prev => [newsItem, ...prev]);
        }

        return nextIndex;
      });
    }, 100); 

    return () => clearInterval(interval);
  }, [loading, allData]);

  // Real-time PnL Calculation
  useEffect(() => {
    if (userPosition && currentPrice > 0) {
        const pnl = ((currentPrice - userPosition.price) / userPosition.price) * 100;
        setPnlPercent(pnl);
    }
  }, [currentPrice, userPosition]);

  const handleSimulationEnd = (finalIndex) => {
    const finalPrice = allData[finalIndex].price;
    const entryPrice = userPosition ? userPosition.price : finalPrice; 
    
    let roi = 0;
    if (userPosition) {
        roi = ((finalPrice - entryPrice) / entryPrice) * 100;
    }
    
    // Calculate Reaction Time (seconds)
    let reactionTime = 999;
    if (userPosition) {
        reactionTime = Math.max(0, (userPosition.index - SIGNAL_INDEX) * 0.1);
    }
    
    // Determine Persona
    let persona = "退出流动性 (Exit Liquidity)";
    if (roi > 0) {
        if (reactionTime <= 1.5) { // Fast reaction threshold: 1.5s
            persona = "内幕猎手 (Alpha Hunter)";
        } else {
            persona = "聪明钱 (Smart Money)";
        }
    }

    // AI Roast Generation
    let roast = "";
    if (roi <= 0) {
        const lossRoasts = [
            "典型的韭菜操作，感谢你为市场提供的流动性，庄家很喜欢你。",
            "你的反应比拨号上网还慢，利润都被机器人吃光了。",
            "凭实力亏的钱，不丢人，下次记得把网线拔了。",
            "这一波操作猛如虎，一看账户负二百五。"
        ];
        roast = lossRoasts[Math.floor(Math.random() * lossRoasts.length)];
    } else {
        if (reactionTime <= 1.0) {
            roast = "华尔街的收割机，你的反应速度让高频交易算法都感到羞愧。";
        } else if (reactionTime <= 2.0) {
            roast = "虽然不是最快的枪手，但绝对是最稳的赢家。";
        } else {
            roast = "虽然手速慢了点，但好在脑子够用，稳稳当当才是真。";
        }
    }

    const totalScore = Math.round(Math.max(0, roi * 10 + (10 - Math.min(reactionTime, 10)) * 5));

    onFinish({
        score: totalScore,
        roi: roi.toFixed(2),
        reactionTime: userPosition ? reactionTime.toFixed(2) + 's' : 'N/A',
        persona,
        roast,
        history: allData,
        userPosition
    });
  };

  const handleBuy = () => {
    if (userPosition) return;
    setUserPosition({
      price: currentPrice,
      index: currentIndex,
      time: Date.now()
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-500 font-mono">正在初始化数据链路...</div>;

  const currentEquity = userPosition 
    ? (1000 * (1 + pnlPercent / 100)).toFixed(2) 
    : balance.toFixed(2);

  return (
    <div className={`app-container ${isVolatile ? 'animate-shake' : ''}`}>
      {isVolatile && <div className="animate-pulse-red fixed inset-0 pointer-events-none z-[999]"></div>}
      {isVolatile && (
        <div className="animate-fade-in-out absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(20,0,0,0.9)] border border-neon-red text-neon-red px-12 py-6 font-mono font-bold text-xl shadow-[0_0_30px_rgba(255,0,60,0.4)] z-[1000] flex items-center gap-4 backdrop-blur-sm whitespace-nowrap">
            <span>🚨 警告：检测到市场异常波动</span>
        </div>
      )}
      <div className="dashboard-card">
        
        {/* Main Panel: Chart & Controls */}
        <div className="main-panel">
            <h1 className={blindMode ? 'blur-sm select-none' : ''}>
                {blindMode ? '绝密行动' : '2024 美国总统大选预测'}
            </h1>
            
            <div className="price-display">
                <span className="label">当前价格</span>
                <span className={`value ${priceFlash ? 'price-flash' : ''}`}>
                    {(currentPrice * 100).toFixed(1)}¢
                </span>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="simTime" stroke="#666" tick={false} />
                        <YAxis domain={[0, 1]} stroke="#666" tickFormatter={(v) => `${(v * 100).toFixed(0)}¢`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #00f3ff', color: '#00f3ff' }}
                            formatter={(v) => [`${(v * 100).toFixed(1)}¢`, '价格']}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#00f3ff" 
                            strokeWidth={2} 
                            dot={false} 
                            isAnimationActive={false} // Disable initial animation for smooth streaming
                        />
                        {userPosition && (
                            <ReferenceDot
                                x={userPosition.index}
                                y={userPosition.price}
                                r={6}
                                shape={FlagMarker} // Custom Flag Icon
                                label={{ position: 'top', value: '买入', fill: '#ff003c', fontSize: 12, fontWeight: 'bold' }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <button 
                className="buy-button" 
                onClick={handleBuy} 
                disabled={!!userPosition}
            >
                {userPosition ? `仓位已锁定` : '立即执行'}
            </button>
        </div>

        {/* Side Panel: News Feed */}
        <div className="side-panel">
            <div className="news-feed">
                <div className="news-header">
                    <Newspaper size={14} /> 实时情报
                </div>
                <div className="news-list" ref={newsListRef}>
                    {newsFeed.map(item => (
                        <div key={item.id} className={`news-item ${item.breaking ? 'breaking' : ''}`}>
                            <span className="news-time">{item.time}</span>
                            <span className="content">{blindMode ? '*****************' : item.content}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>

      {/* Bottom Dashboard */}
      <div className="bottom-dashboard">
            <div className="dash-item">
                <span className="dash-label flex items-center gap-1"><DollarSign size={12}/> 当前余额</span>
                <span className="dash-value">${currentEquity}</span>
            </div>
            <div className="dash-item">
                <span className="dash-label flex items-center gap-1"><Activity size={12}/> 持仓成本</span>
                <span className="dash-value">
                    {userPosition ? `${(userPosition.price * 100).toFixed(1)}¢` : '--'}
                </span>
            </div>
            <div className="dash-item">
                <span className="dash-label flex items-center gap-1">
                    {pnlPercent >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} 实时盈亏 %
                </span>
                <span className={`dash-value ${pnlPercent > 0 ? 'text-neon-green' : pnlPercent < 0 ? 'text-neon-red' : ''}`}>
                    {pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                </span>
            </div>
      </div>

    </div>
  );
};

const Result = ({ result, onRestart }) => {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000_100%)]"></div>
      
      {/* Performance Card */}
      <div className="performance-card relative z-10 max-w-md w-full bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header Gradient */}
        <div className={`h-2 w-full ${result.roi > 0 ? 'bg-gradient-to-r from-neon-green to-blue-500' : 'bg-gradient-to-r from-neon-red to-orange-500'}`}></div>
        
        <div className="p-8 flex flex-col items-center">
            {/* Persona Badge */}
            <div className="mb-6">
                <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border ${
                    result.roi > 0 
                    ? 'border-neon-green text-neon-green bg-neon-green/10' 
                    : 'border-neon-red text-neon-red bg-neon-red/10'
                }`}>
                    {result.roi > 0 ? '盈利 (PROFITABLE)' : '亏损 (LIQUIDATED)'}
                </span>
            </div>

            <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tight">
                {result.persona.split('(')[0]}
            </h1>
            <p className="text-sm text-gray-500 mb-8 font-mono">{result.persona.split('(')[1].replace(')', '')}</p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="metric-box bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">最终收益率 (ROI)</span>
                    <span className={`text-2xl font-bold ${result.roi > 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                        {result.roi > 0 ? '+' : ''}{result.roi}%
                    </span>
                </div>
                <div className="metric-box bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">反应时间</span>
                    <span className="text-2xl font-bold text-blue-400">
                        {result.reactionTime}
                    </span>
                </div>
            </div>

            {/* AI Roast */}
            <div className="ai-roast w-full bg-[#111] p-4 rounded-xl border border-dashed border-[#333] mb-8 relative">
                <div className="absolute -top-3 left-4 bg-[#0a0a0a] px-2 text-xs text-purple-500 font-bold flex items-center gap-1">
                     AI 深度分析
                </div>
                <p className="text-gray-300 text-sm italic leading-relaxed text-center">
                    "{result.roast}"
                </p>
            </div>

            {/* Footer / Share */}
            <div className="w-full flex items-center justify-between border-t border-white/10 pt-6">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">PolyChronos 聚时</span>
                    <span className="text-[10px] text-gray-600">生成于 {new Date().toLocaleDateString()}</span>
                </div>
                {/* QR Placeholder */}
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
  const [appMode, setAppMode] = useState('lobby'); // lobby, sim, result
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [blindMode, setBlindMode] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleSelectScenario = (scenario) => {
    setSelectedScenario(scenario);
    setAppMode('sim');
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
      {appMode === 'sim' && selectedScenario && (
        <Simulation 
            slug={selectedScenario.slug} 
            blindMode={blindMode}
            onFinish={handleSimulationFinish}
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
