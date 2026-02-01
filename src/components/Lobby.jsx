import React, { useMemo, useState, useEffect } from 'react';
import { Clock, ArrowRight, Scan, Activity, TrendingUp, DollarSign } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SCENARIOS } from '../constants/scenarios';
import axios from 'axios';

// --- Animated Cosmic Background (CSS Version) ---
const AnimatedBackground = () => {
  const stars = useMemo(() => 
    [...Array(80)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 2}s`,
    })), []
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Deep cosmic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1040] to-[#0a0a1a]" />
      
      {/* Aurora glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00d4ff] rounded-full blur-[150px] opacity-20 animate-pulse" />
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#ff66cc] rounded-full blur-[150px] opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-[#ffd700] rounded-full blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Swirling aurora rings around clock (CSS Animation) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00d4ff]/30 animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute inset-16 rounded-full border-4 border-transparent border-b-[#ff66cc]/30 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
        <div className="absolute inset-32 rounded-full border-4 border-transparent border-l-[#ffd700]/30 animate-spin" style={{ animationDuration: '30s' }} />
      </div>
      
      {/* Twinkling stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: 0.2,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
};

// --- Glass Card Component ---
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
      className={`
        relative backdrop-blur-xl 
        border rounded-2xl 
        ${variants[variant] || variants.default}
        transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// --- Lobby Component ---
const Lobby = ({ onSelect, blindMode, setBlindMode }) => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/markets');
        setMarkets(res.data);
      } catch (err) {
        console.error("Failed to fetch markets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
  }, []);

  return (
    <div className="min-h-screen font-sans p-8 flex flex-col items-center relative overflow-hidden text-gray-200">
      <AnimatedBackground />
      
      <header 
        className="w-full max-w-6xl flex justify-between items-center mb-16 border-b border-[#6450c8]/30 pb-6 transition-all duration-500 transform translate-y-0 opacity-100"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Clock className="text-[#ffd700] w-10 h-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-wide text-[#f0e6ff]">
              PolyChronos
            </h1>
            <p className="text-sm text-[#a0a0c0] font-medium">聚时 · 时间交易模拟器</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <ConnectButton />
          
          <label 
            className="flex items-center cursor-pointer gap-3 group hover:scale-105 transition-transform"
          >
            <span className={`text-sm font-medium transition-colors ${blindMode ? 'text-[#ff4466]' : 'text-[#00d4ff]'}`}>
              {blindMode ? '盲测模式' : '普通模式'}
            </span>
            <button 
              onClick={() => setBlindMode(!blindMode)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
                blindMode 
                  ? 'bg-[#2a0a1a] border border-[#ff4466]/50' 
                  : 'bg-[#0a1a2a] border border-[#00d4ff]/50'
              }`}
            >
              <span 
                className={`inline-block h-5 w-5 rounded-full shadow-md transition-transform duration-300 ${blindMode ? 'bg-[#ff4466] translate-x-7' : 'bg-[#00d4ff] translate-x-1'}`}
              />
            </button>
          </label>
        </div>
      </header>

      <main className="w-full max-w-6xl">
        <div className="mb-12 transition-all duration-500 delay-100">
          <h2 className="text-4xl font-bold text-[#f0e6ff] mb-2">
            选择历史时刻
          </h2>
          <p className="text-[#a0a0c0]">穿越时间，重温历史性市场事件，测试你的交易直觉</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SCENARIOS.map((scenario, index) => {
            const marketData = markets.find(m => m.slug === scenario.slug);
            const volume = marketData ? marketData.volume : 0;
            const lastPrice = marketData ? marketData.last_price : 0.50;
            const odds = (lastPrice * 100).toFixed(1) + '%';
            
            // Format volume (e.g., 1.2M)
            const formattedVolume = volume > 1000000 
              ? `$${(volume / 1000000).toFixed(2)}M` 
              : `$${(volume / 1000).toFixed(2)}K`;

            const difficultyColorClass = {
                '极高': 'text-[#ff4466] border-[#ff4466]/50 bg-[#ff4466]/10',
                '较低': 'text-[#00ff9d] border-[#00ff9d]/50 bg-[#00ff9d]/10'
            }[scenario.difficulty] || 'text-[#00d4ff] border-[#00d4ff]/50 bg-[#00d4ff]/10';

            return (
              <div
                key={scenario.id}
                className="transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => onSelect(scenario)}
              >
                <GlassCard className="p-6 cursor-pointer h-full group flex flex-col" variant="default">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 text-xs font-bold border rounded-full ${difficultyColorClass}`}>
                      {scenario.difficulty}
                    </span>
                    <Clock className="text-[#ffd700] group-hover:text-[#00d4ff] transition-colors" style={{ filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.4))' }} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-[#f0e6ff] group-hover:text-[#00d4ff] transition-colors">
                    {scenario.title}
                  </h3>
                  
                  <p className="text-sm text-[#a0a0c0] mb-6 leading-relaxed">
                    {scenario.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                    <div className="bg-[#0a0a1a]/50 rounded-lg p-3 border border-[#6450c8]/20">
                      <div className="flex items-center gap-2 text-xs text-[#a0a0c0] mb-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>当前赔率</span>
                      </div>
                      <div className="text-lg font-bold text-[#00d4ff]">
                        {odds}
                      </div>
                    </div>
                    <div className="bg-[#0a0a1a]/50 rounded-lg p-3 border border-[#6450c8]/20">
                      <div className="flex items-center gap-2 text-xs text-[#a0a0c0] mb-1">
                        <Activity className="w-3 h-3" />
                        <span>总交易量</span>
                      </div>
                      <div className="text-lg font-bold text-[#ffd700]">
                        {formattedVolume}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#6450c8]/30">
                    <div className="flex gap-2">
                      {scenario.tags.map(tag => (
                        <span key={tag} className="text-xs text-[#ff66cc] bg-[#ff66cc]/10 px-2 py-1 rounded-full border border-[#ff66cc]/30">#{tag}</span>
                      ))}
                    </div>
                    <div 
                      className="flex items-center text-xs text-[#00d4ff] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      进入 <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
          
          <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
            <GlassCard className="p-6 h-full flex flex-col justify-center items-center min-h-[300px]">
              <Clock className="w-16 h-16 mb-4 text-[#6450c8]" />
              <p className="text-sm text-[#a0a0c0]">更多历史时刻即将开放</p>
            </GlassCard>
          </div>

          <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
            <GlassCard className="p-6 h-full flex flex-col justify-center items-center min-h-[300px]">
              <Clock className="w-16 h-16 mb-4 text-[#6450c8]" />
              <p className="text-sm text-[#a0a0c0]">更多历史时刻即将开放，敬请期待</p>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lobby;
