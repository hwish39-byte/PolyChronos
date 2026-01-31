"use client"

import React from "react"

import { useState, useEffect, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot, Area, AreaChart } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, Activity, Trophy, ArrowRight, RotateCcw, Flag, Newspaper, 
  DollarSign, TrendingUp, TrendingDown, Clock, LogOut, Zap, 
  Radio, Target, Gauge, AlertTriangle, Sparkles, Play, Pause
} from 'lucide-react';

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
];

// --- Animated Cosmic Background with Aurora and Stars ---
const AnimatedBackground = () => {
  const stars = useMemo(() => 
    [...Array(80)].map((_, i) => ({
      id: i,
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: Math.random() * 2 + 0.5,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 1,
    })), []
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Deep cosmic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1040] to-[#0a0a1a]" />
      
      {/* Aurora glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00d4ff] rounded-full blur-[150px] opacity-20" />
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#ff66cc] rounded-full blur-[150px] opacity-15" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-[#ffd700] rounded-full blur-[150px] opacity-10" />
      <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#ff9933] rounded-full blur-[150px] opacity-15" />
      
      {/* Swirling aurora rings around clock */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div 
          className="w-[600px] h-[600px] rounded-full border-4 border-transparent"
          style={{
            background: 'linear-gradient(45deg, transparent 40%, rgba(0,212,255,0.3) 50%, transparent 60%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className="absolute inset-8 rounded-full"
          style={{
            background: 'linear-gradient(-45deg, transparent 40%, rgba(255,102,204,0.3) 50%, transparent 60%)',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className="absolute inset-16 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent 40%, rgba(255,215,0,0.2) 50%, transparent 60%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      
      {/* Central Clock with Roman numerals */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg width="400" height="400" viewBox="0 0 200 200" className="opacity-30">
          {/* Outer rainbow ring */}
          <defs>
            <linearGradient id="clockRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="25%" stopColor="#ff66cc" />
              <stop offset="50%" stopColor="#ffd700" />
              <stop offset="75%" stopColor="#ff9933" />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
          </defs>
          
          {/* Clock face background */}
          <circle cx="100" cy="100" r="85" fill="rgba(0,0,0,0.6)" />
          
          {/* Colorful ring */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="url(#clockRingGradient)" strokeWidth="4" opacity="0.8" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="1" />
          
          {/* Roman numerals */}
          {['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].map((numeral, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = 100 + 65 * Math.cos(angle);
            const y = 100 + 65 * Math.sin(angle) + 4;
            return (
              <text 
                key={i} 
                x={x} 
                y={y} 
                textAnchor="middle" 
                fill="#ffd700" 
                fontSize="8" 
                fontFamily="serif"
                opacity="0.8"
              >
                {numeral}
              </text>
            );
          })}
          
          {/* Hour hand */}
          <motion.line
            x1="100"
            y1="100"
            x2="100"
            y2="50"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{ duration: 3600, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '100px 100px' }}
          />
          
          {/* Minute hand */}
          <motion.line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            stroke="#00d4ff"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '100px 100px' }}
          />
          
          {/* Center dot */}
          <circle cx="100" cy="100" r="5" fill="#ffd700" />
          <circle cx="100" cy="100" r="3" fill="#ffffff" />
        </svg>
      </div>
      
      {/* Twinkling stars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {stars.map((star) => (
          <motion.circle
            key={star.id}
            cx={`${star.cx}%`}
            cy={`${star.cy}%`}
            r={star.r}
            fill="#ffffff"
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
        {/* Colored stars */}
        {[...Array(15)].map((_, i) => (
          <motion.path
            key={`star-${i}`}
            d="M0,-5 L1.5,-1.5 L5,0 L1.5,1.5 L0,5 L-1.5,1.5 L-5,0 L-1.5,-1.5 Z"
            fill={['#ffd700', '#00d4ff', '#ff66cc', '#ff9933'][i % 4]}
            transform={`translate(${Math.random() * 100}%, ${Math.random() * 100}%) scale(${Math.random() * 0.5 + 0.3})`}
            initial={{ opacity: 0.3, rotate: 0 }}
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
              rotate: 360,
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </svg>
      
      {/* Colorful particles rising */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.circle
            key={`particle-${i}`}
            r={Math.random() * 3 + 1}
            fill={['#00d4ff', '#ff66cc', '#ffd700', '#ff9933', '#9966ff'][i % 5]}
            initial={{
              cx: `${Math.random() * 100}%`,
              cy: '100%',
              opacity: 0,
            }}
            animate={{
              cy: ['100%', '0%'],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 12 + 8,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
      
      {/* Rainbow streaks at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden opacity-40">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent">
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#00d4ff] via-[#ff66cc] to-[#ffd700]"
            style={{ filter: 'blur(10px)' }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div 
            className="absolute bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-[#ff9933] via-[#00d4ff] to-[#ff66cc]"
            style={{ filter: 'blur(8px)' }}
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
};

// --- Price Display with Cosmic Theme ---
const PriceDisplay = ({ price, isVolatile }: { price: number; isVolatile: boolean }) => {
  const [flash, setFlash] = useState(false);
  const prevPrice = useRef(price);

  useEffect(() => {
    if (price !== prevPrice.current) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 200);
      prevPrice.current = price;
      return () => clearTimeout(timer);
    }
  }, [price]);

  return (
    <motion.div
      className="relative"
      animate={flash ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`text-6xl font-serif font-bold tracking-tight transition-all duration-200 ${
          isVolatile 
            ? 'text-[#ff4466]' 
            : 'text-[#00d4ff]'
        }`}
        style={{
          textShadow: isVolatile 
            ? '0 0 20px rgba(255,68,102,0.6), 0 0 40px rgba(255,68,102,0.4)' 
            : '0 0 20px rgba(0,212,255,0.6), 0 0 40px rgba(0,212,255,0.4)',
        }}
      >
        ${price.toFixed(2)}
      </div>
    </motion.div>
  );
};

// --- Glass Card Component - Cosmic Theme ---
const GlassCard = ({ children, className = '', variant = 'default' }: { children: React.ReactNode; className?: string; variant?: string }) => {
  const variants: Record<string, string> = {
    default: 'bg-[#140a28]/70 border-[#6450c8]/30 shadow-lg shadow-purple-900/20',
    gold: 'bg-gradient-to-br from-[#1a1040]/80 to-[#140a28]/70 border-[#ffd700]/30 shadow-lg shadow-amber-900/20',
    cyan: 'bg-gradient-to-br from-[#0a1a2a]/80 to-[#140a28]/70 border-[#00d4ff]/30 shadow-lg shadow-cyan-900/20',
    danger: 'bg-gradient-to-br from-[#2a0a1a]/80 to-[#140a28]/70 border-[#ff4466]/30 shadow-lg shadow-red-900/20',
  };

  return (
    <div
      className={`
        relative backdrop-blur-xl 
        border rounded-2xl 
        ${variants[variant] || variants.default}
        transition-all duration-300 hover:shadow-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// --- Loading Screen with Cosmic Clock Theme ---
const LoadingScreen = ({ status, onEnter }: { status: string; onEnter: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center font-sans">
      <AnimatedBackground />
      
      <motion.div 
        className="z-10 flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Cosmic Clock Loader */}
        <div className="relative w-48 h-48">
          {/* Outer aurora ring */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #00d4ff, #ff66cc, #ffd700, #ff9933, #00d4ff)',
              padding: '4px',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-full h-full rounded-full bg-[#0a0a1a]" />
          </motion.div>
          
          <svg viewBox="0 0 100 100" className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)]">
            {/* Clock face */}
            <circle cx="50" cy="50" r="45" fill="rgba(10,10,26,0.9)" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(100,80,200,0.3)" strokeWidth="1" />
            
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x1 = 50 + 35 * Math.cos(angle);
              const y1 = 50 + 35 * Math.sin(angle);
              const x2 = 50 + 40 * Math.cos(angle);
              const y2 = 50 + 40 * Math.sin(angle);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffd700" strokeWidth="2" opacity="0.8" />
              );
            })}
            
            {/* Animated minute hand */}
            <motion.line
              x1="50"
              y1="50"
              x2="50"
              y2="20"
              stroke="#00d4ff"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '50px 50px' }}
            />
            
            {/* Animated second hand */}
            <motion.line
              x1="50"
              y1="50"
              x2="50"
              y2="15"
              stroke="#ff66cc"
              strokeWidth="1"
              strokeLinecap="round"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '50px 50px' }}
            />
            
            <circle cx="50" cy="50" r="4" fill="#ffd700" />
            <circle cx="50" cy="50" r="2" fill="#ffffff" />
          </svg>
          
          {status === 'ready' && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center bg-[#0a0a1a]/90 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Zap className="w-12 h-12 text-[#ffd700]" style={{ filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.6))' }} />
            </motion.div>
          )}
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-wide text-[#f0e6ff] cosmic-text-cyan">
            {status === 'fetching' ? '时间回溯中...' : '准备就绪'}
          </h2>
          <motion.p 
            className="text-sm text-[#a0a0c0]"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {status === 'fetching' ? '正在同步 7 月 13 日历史数据...' : '数据加载完成'}
          </motion.p>
        </div>

        {status === 'ready' && (
          <motion.button
            onClick={onEnter}
            className="mt-4 px-12 py-4 bg-gradient-to-r from-[#00d4ff] to-[#ff66cc] text-white font-bold tracking-wide rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            开启时空之旅
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

// --- Data Processing Helper ---
const processTradeData = (rawData: any[]) => {
  if (!Array.isArray(rawData)) return [];
  return rawData.map((trade, index) => {
    if (!trade) return null;
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
  }).filter(item => item !== null);
};

// --- Generate mock data for demo ---
const generateMockData = () => {
  const data = [];
  let price = 0.6;
  for (let i = 0; i < 500; i++) {
    // Simulate event at index 200
    if (i === 200) price -= 0.15;
    if (i > 200 && i < 300) price += Math.random() * 0.02;
    
    price += (Math.random() - 0.5) * 0.02;
    price = Math.max(0.01, Math.min(0.99, price));
    
    data.push({
      price,
      size: Math.random() * 1000,
      simTime: i,
      blockNumber: 59311000 + i,
      time: Date.now() / 1000 + i,
      displayTime: new Date().toLocaleTimeString(),
    });
  }
  return data;
};

// --- Lobby Component ---
const Lobby = ({ onSelect, blindMode, setBlindMode }: { 
  onSelect: (scenario: typeof SCENARIOS[0]) => void; 
  blindMode: boolean; 
  setBlindMode: (v: boolean) => void;
}) => {
  return (
    <div className="min-h-screen font-sans p-8 flex flex-col items-center relative overflow-hidden">
      <AnimatedBackground />
      
      <motion.header 
        className="w-full max-w-6xl flex justify-between items-center mb-16 border-b border-[#6450c8]/30 pb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Clock className="text-[#ffd700] w-10 h-10" style={{ filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-wide text-[#f0e6ff] cosmic-text-gold">
              PolyChronos
            </h1>
            <p className="text-sm text-[#a0a0c0] font-medium">聚时 · 时间交易模拟器</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <motion.label 
            className="flex items-center cursor-pointer gap-3 group"
            whileHover={{ scale: 1.02 }}
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
              <motion.span 
                className={`inline-block h-5 w-5 rounded-full shadow-md ${blindMode ? 'bg-[#ff4466]' : 'bg-[#00d4ff]'}`}
                animate={{ x: blindMode ? 28 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </motion.label>
        </div>
      </motion.header>

      <main className="w-full max-w-6xl">
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-[#f0e6ff] mb-2 cosmic-text-cyan">
            选择历史时刻
          </h2>
          <p className="text-[#a0a0c0]">穿越时间，重温历史性市场事件，测试你的交易直觉</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SCENARIOS.map((scenario, index) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => onSelect(scenario)}
            >
              <GlassCard className="p-6 cursor-pointer h-full group" variant="default">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 text-xs font-bold text-[#ff4466] border border-[#ff4466]/50 rounded-full bg-[#ff4466]/10">
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
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#6450c8]/30">
                  <div className="flex gap-2">
                    {scenario.tags.map(tag => (
                      <span key={tag} className="text-xs text-[#ff66cc] bg-[#ff66cc]/10 px-2 py-1 rounded-full border border-[#ff66cc]/30">#{tag}</span>
                    ))}
                  </div>
                  <motion.div 
                    className="flex items-center text-xs text-[#00d4ff] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    进入 <ArrowRight className="w-4 h-4 ml-1" />
                  </motion.div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-6 h-full flex flex-col justify-center items-center opacity-60">
              <Clock className="w-16 h-16 mb-4 text-[#6450c8]" />
              <p className="text-sm text-[#a0a0c0]">更多历史时刻即将开放</p>
            </GlassCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

// --- Simulation Component ---
const Simulation = ({ slug, blindMode, onFinish, preloadedData }: {
  slug: string;
  blindMode: boolean;
  onFinish: (data: any) => void;
  preloadedData: any[];
}) => {
  const [allData, setAllData] = useState(preloadedData?.length ? preloadedData : generateMockData());
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

  const [loading, setLoading] = useState(false);
  const [priceFlash, setPriceFlash] = useState(false);
  const [speed, setSpeed] = useState(60);
  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [userSpeedMultiplier, setUserSpeedMultiplier] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [isVolatile, setIsVolatile] = useState(false);
  const volatilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [newsFeed, setNewsFeed] = useState<any[]>([]);
  const [balance, setBalance] = useState(100000);
  const [shares, setShares] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [totalFees, setTotalFees] = useState(0);
  const [lastBuyTime, setLastBuyTime] = useState(0);
  const [isPendingOrder, setIsPendingOrder] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const currentIndexRef = useRef(currentIndex);
  const balanceRef = useRef(balance);
  const sharesRef = useRef(shares);
  const allDataRef = useRef(allData);
  const buyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sellTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const newsListRef = useRef<HTMLDivElement>(null);
  const triggeredScriptIds = useRef(new Set());
  const eventTriggerIndexRef = useRef<number | null>(null);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    balanceRef.current = balance;
    sharesRef.current = shares;
    allDataRef.current = allData;
  }, [currentIndex, balance, shares, allData]);

  useEffect(() => {
    return () => {
      if (buyTimeoutRef.current) clearTimeout(buyTimeoutRef.current);
      if (sellTimeoutRef.current) clearTimeout(sellTimeoutRef.current);
    };
  }, []);

  const equity = balance + (shares * currentPrice);
  const pnlPercent = ((equity - 100000) / 100000) * 100;
  const SIGNAL_INDEX = 10;

  const playAlertSound = () => {
    console.log("ALERT: HIGH VOLATILITY");
  };

  // Volatility monitoring
  useEffect(() => {
    if (currentIndex < 30 || !allData[Math.floor(currentIndex)]) return;
    const idx = Math.floor(currentIndex);
    const currentTrade = allData[idx];
    const pastTrade = allData[idx - 5];

    if (currentTrade && pastTrade && pastTrade.price > 0) {
      const priceChange = Math.abs((currentTrade.price - pastTrade.price) / pastTrade.price);
      if (priceChange > 0.10) {
        if (!isVolatile) playAlertSound();
        setIsVolatile(true);
        if (volatilityTimeoutRef.current) clearTimeout(volatilityTimeoutRef.current);
        volatilityTimeoutRef.current = setTimeout(() => setIsVolatile(false), 3000);
      }
    }
  }, [currentIndex, allData, isVolatile]);

  // Simulation loop
  useEffect(() => {
    if (loading || allData.length === 0 || isFinishing || isPaused || !hasStarted) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
      return;
    }

    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
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

  // Progress & news triggers
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
        if (event.id === 'r1') eventTriggerIndexRef.current = index;
        setNewsFeed(prev => [{
          id: event.id + Date.now(),
          time: new Date().toLocaleTimeString(),
          content: event.content,
          type: event.type
        }, ...prev]);
      });
    }

    // Progress-based triggers
    const progressEvents = TRUMP_SCRIPT.filter(event =>
      !event.block &&
      event.progress &&
      newProgress >= event.progress &&
      !triggeredScriptIds.current.has(event.id)
    );

    progressEvents.forEach(event => {
      triggeredScriptIds.current.add(event.id);
      setNewsFeed(prev => [{
        id: event.id + Date.now(),
        time: new Date().toLocaleTimeString(),
        content: event.content,
        type: event.type
      }, ...prev]);
    });

    // Random noise
    if (Math.random() < 0.005) {
      const randomNews = CRYPTO_NOISE[Math.floor(Math.random() * CRYPTO_NOISE.length)];
      setNewsFeed(prev => [{
        id: 'noise-' + Date.now(),
        time: new Date().toLocaleTimeString(),
        content: randomNews,
        type: 'noise'
      }, ...prev]);
    }
  }, [currentIndex, allData]);

  const handleBuyClick = () => {
    setIsBuyModalOpen(true);
    setIsPaused(true);
  };

  const handleConfirmBuy = (amountStr: string) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0 || amount * 1.001 > balance) {
      alert("Invalid amount or insufficient funds");
      return;
    }

    setIsPendingOrder(true);
    setIsBuyModalOpen(false);
    setIsPaused(false);

    const latency = Math.random() * 2000 + 1000;
    setToastMsg(`订单提交中: 买入 $${amount}...`);

    buyTimeoutRef.current = setTimeout(() => {
      const executionPrice = allDataRef.current[Math.floor(currentIndexRef.current)].price;
      const fee = amount * 0.001;
      const netAmount = amount - fee;
      const newShares = netAmount / executionPrice;

      setBalance(prev => prev - amount);
      setShares(prev => prev + newShares);
      setTotalFees(prev => prev + fee);

      setAvgPrice(prevAvg => {
        const totalVal = (prevAvg * sharesRef.current) + amount;
        const totalShares = sharesRef.current + newShares;
        return totalVal / totalShares;
      });

      setTradeHistory(prev => [{
        id: Date.now(),
        type: 'BUY',
        price: executionPrice,
        amount: amount,
        shares: newShares,
        time: new Date().toLocaleTimeString(),
        index: currentIndexRef.current
      }, ...prev]);

      setToastMsg(`成交: 买入 ${newShares.toFixed(0)} YES @ $${executionPrice.toFixed(2)}`);
      setIsPendingOrder(false);
      setTimeout(() => setToastMsg(null), 3000);
    }, latency);
  };

  const handleCancelBuy = () => {
    setIsBuyModalOpen(false);
    setIsPaused(false);
  };

  const handleSell = () => {
    if (shares <= 0) return;

    setIsPendingOrder(true);
    const amountToSell = shares;
    setToastMsg(`订单提交中: 卖出 ${amountToSell.toFixed(0)} YES...`);

    const latency = Math.random() * 2000 + 1000;

    sellTimeoutRef.current = setTimeout(() => {
      const executionPrice = allDataRef.current[Math.floor(currentIndexRef.current)].price;
      const grossValue = amountToSell * executionPrice;
      const fee = grossValue * 0.001;
      const netValue = grossValue - fee;

      setBalance(prev => prev + netValue);
      setShares(0);
      setAvgPrice(0);
      setTotalFees(prev => prev + fee);

      setTradeHistory(prev => [{
        id: Date.now(),
        type: 'SELL',
        price: executionPrice,
        amount: netValue,
        shares: amountToSell,
        time: new Date().toLocaleTimeString(),
        index: currentIndexRef.current
      }, ...prev]);

      setToastMsg(`成交: 卖出全部 @ $${executionPrice.toFixed(2)}`);
      setIsPendingOrder(false);
      setTimeout(() => setToastMsg(null), 3000);
    }, latency);
  };

  const handleSimulationEnd = (finalIndex: number) => {
    setIsFinishing(true);

    let finalEquity = balanceRef.current;
    const finalPrice = allDataRef.current[finalIndex].price;

    if (sharesRef.current > 0) {
      finalEquity += sharesRef.current * finalPrice;
    }

    const INITIAL_CAPITAL = 100000;
    const totalPnL = (finalEquity - INITIAL_CAPITAL).toFixed(2);
    const roi = ((parseFloat(totalPnL) / INITIAL_CAPITAL) * 100).toFixed(2);
    const startPrice = allDataRef.current[0].price;
    const hodlRoi = (((finalPrice - startPrice) / startPrice) * 100).toFixed(2);

    let persona = "韭菜 (Noob)";
    let roast = "你在想什么？";
    const netPnL = parseFloat(totalPnL);

    if (netPnL < -50000) {
      persona = "慈善赌王 (Philanthropist)";
      roast = "感谢你为市场流动性做出的卓越贡献。";
    } else if (netPnL < 0) {
      persona = "韭菜 (Noob)";
      roast = "标准的散户操作。追涨杀跌，一气呵成。";
    } else if (netPnL < 10000) {
      persona = "保本大师 (Break-even Master)";
      roast = "一顿操作猛如虎，一看收益两块五。";
    } else if (netPnL < INITIAL_CAPITAL * 0.5) {
      persona = "顺势交易员 (Trader)";
      roast = "你抓住了趋势，但犹豫让你错过了暴富的机会。";
    } else if (netPnL < INITIAL_CAPITAL * 2) {
      persona = "华尔街之狼 (Wolf)";
      roast = "精准的嗅觉，果断的执行。";
    } else {
      persona = "时间旅行者 (Time Traveler)";
      roast = "别装了，你肯定是穿越回来的。";
    }

    const summary = `在 ${SCENARIOS[0].title} 事件中，你获得了 ${roi}% 的收益`;

    onFinish({
      totalPnL,
      roi,
      hodlRoi,
      maxDrawdown: 12.5,
      totalTrades: tradeHistory.length,
      persona,
      summary,
      roast,
      finalBalance: finalEquity
    });
  };

  const handleEarlyExit = () => {
    if (window.confirm("确定要提前结束模拟并结算吗？")) {
      handleSimulationEnd(Math.floor(currentIndex));
    }
  };

  const getStageLabel = () => {
    if (currentIndex < 100) return "开盘期";
    if (currentIndex > allData.length - 200) return "收盘期";
    if (isVolatile) return "剧烈波动";
    return "交易中";
  };

  const togglePause = () => setIsPaused(!isPaused);
  const changeSpeed = (multiplier: number) => setUserSpeedMultiplier(multiplier);

  // Chart data slice
  const visibleData = useMemo(() => {
    const endIdx = Math.floor(currentIndex) + 1;
    const startIdx = Math.max(0, endIdx - 100);
    return allData.slice(startIdx, endIdx);
  }, [allData, currentIndex]);

  return (
    <div className="flex h-screen font-sans overflow-hidden relative">
      <AnimatedBackground />

      {/* Start Overlay */}
      <AnimatePresence>
        {!hasStarted && !loading && (
          <motion.div
            className="absolute inset-0 z-50 bg-[#0a0a1a]/90 backdrop-blur-md flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="text-center space-y-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative inline-block">
                <Clock className="w-24 h-24 text-[#ffd700] mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.5))' }} />
              </div>
              <h1 className="text-4xl font-bold text-[#f0e6ff] cosmic-text-gold">
                准备好穿越了吗？
              </h1>
              <p className="text-[#a0a0c0]">时间的洪流即将带你回到那个历史性时刻</p>
              <motion.button
                onClick={() => {
                  setHasStarted(true);
                  playAlertSound();
                }}
                className="px-10 py-4 bg-gradient-to-r from-[#00d4ff] to-[#ff66cc] text-white font-bold tracking-wide rounded-xl shadow-lg shadow-cyan-500/30"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <Play size={20} /> 开始模拟
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b border-[#6450c8]/30 flex items-center justify-between px-6 bg-[#140a28]/60 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isVolatile ? 'bg-[#ff4466] animate-ping' : 'bg-[#00ff88]'}`} />
              <Radio size={16} className={isVolatile ? 'text-[#ff4466]' : 'text-[#00d4ff]'} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#f0e6ff] flex items-center gap-2">
                {SCENARIOS[0].title}
                {blindMode && <span className="text-[10px] bg-[#ff4466]/20 text-[#ff4466] px-2 py-0.5 rounded-full border border-[#ff4466]/50">盲测</span>}
              </h1>
              <span className="text-[10px] text-[#00d4ff] font-medium">
                {loading ? '同步中...' : '实时回放'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a1a2a] border border-[#00d4ff]/30">
              <Gauge size={14} className="text-[#00d4ff]" />
              <span className="text-[#a0a0c0]">延迟:</span>
              <span className="text-[#00d4ff] font-bold">24ms</span>
            </div>
            <motion.div 
              className={`px-3 py-1 rounded-full ${isVolatile ? 'bg-[#2a0a1a] border border-[#ff4466]/50' : 'bg-[#0a2a1a] border border-[#00ff88]/50'}`}
              animate={isVolatile ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: isVolatile ? Infinity : 0 }}
            >
              {isVolatile ? (
                <span className="text-[#ff4466] font-bold flex items-center gap-1">
                  <AlertTriangle size={14} /> 高波动
                </span>
              ) : (
                <span className="text-[#00ff88] font-medium">稳定</span>
              )}
            </motion.div>
          </div>
        </header>

        {/* Chart Area */}
        <div className="flex-1 relative p-6">
          {/* Price Display */}
          <div className="absolute top-8 left-8 z-10">
            <PriceDisplay price={currentPrice} isVolatile={isVolatile} />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold bg-[#00d4ff]/20 px-3 py-1 rounded-full text-[#00d4ff] border border-[#00d4ff]/30">YES</span>
              <span className="text-xs text-[#a0a0c0]">TRUMP 2024</span>
            </div>
          </div>

          {/* Toast */}
          <AnimatePresence>
            {toastMsg && (
              <motion.div
                className="absolute top-8 right-8 z-30"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
              >
                <GlassCard className="px-4 py-3 flex items-center gap-3" variant={toastMsg.includes('成交') ? 'cyan' : 'default'}>
                  {toastMsg.includes('成交') ? (
                    <Sparkles size={16} className="text-[#00ff88]" />
                  ) : (
                    <Clock size={16} className="text-[#ffd700] animate-spin" />
                  )}
                  <span className="text-sm font-medium text-[#f0e6ff]">{toastMsg}</span>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chart */}
          <div className="absolute inset-6 top-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visibleData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isVolatile ? "#ff4466" : "#00d4ff"} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isVolatile ? "#ff4466" : "#00d4ff"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 80, 200, 0.15)" />
                <XAxis 
                  dataKey="simTime" 
                  stroke="rgba(100, 80, 200, 0.3)" 
                  tick={{ fontSize: 10, fill: 'rgba(160, 160, 192, 0.8)' }}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  stroke="rgba(100, 80, 200, 0.3)"
                  tick={{ fontSize: 10, fill: 'rgba(160, 160, 192, 0.8)' }}
                  tickFormatter={(v) => `$${v.toFixed(2)}`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(20, 10, 40, 0.95)',
                    border: '1px solid rgba(100, 80, 200, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    color: '#f0e6ff',
                  }}
                  labelStyle={{ color: '#a0a0c0' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isVolatile ? "#ff4466" : "#00d4ff"}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
                {tradeHistory.map(trade => {
                  const dataPoint = visibleData.find(d => Math.abs(d.simTime - trade.index) < 1);
                  if (!dataPoint) return null;
                  return (
                    <ReferenceDot
                      key={trade.id}
                      x={dataPoint.simTime}
                      y={trade.price}
                      r={6}
                      fill={trade.type === 'BUY' ? '#00ff88' : '#ff4466'}
                      stroke="#0a0a1a"
                      strokeWidth={2}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Playback Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <GlassCard className="flex items-center gap-3 px-4 py-3">
              <motion.button
                onClick={togglePause}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#ff66cc] text-white flex items-center justify-center shadow-lg shadow-cyan-500/30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </motion.button>

              <div className="h-8 w-px bg-[#6450c8]/30 mx-2" />

              {[1, 2, 4, 10].map(m => (
                <motion.button
                  key={m}
                  onClick={() => changeSpeed(m)}
                  className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
                    userSpeedMultiplier === m
                      ? 'bg-[#00d4ff] text-[#0a0a1a] shadow-lg shadow-cyan-500/30'
                      : 'text-[#a0a0c0] hover:text-[#00d4ff] bg-[#140a28] hover:bg-[#1a1040] border border-[#6450c8]/30'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {m}x
                </motion.button>
              ))}
            </GlassCard>
          </div>

          {/* Progress Bar */}
          <div className="absolute top-8 right-8 w-64 z-10">
            <div className="flex justify-between text-[10px] text-[#a0a0c0] mb-2 uppercase tracking-wider font-medium">
              <span>回测进度</span>
              <span className={isVolatile ? 'text-[#ff4466]' : 'text-[#00d4ff]'}>
                {getStageLabel()}
              </span>
            </div>
            <div className="w-full h-2 bg-[#140a28] rounded-full overflow-hidden border border-[#6450c8]/30">
              <motion.div
                className={`h-full ${isVolatile ? 'bg-gradient-to-r from-[#ff4466] to-[#ff9933]' : 'bg-gradient-to-r from-[#00d4ff] to-[#ff66cc]'}`}
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Trading Panel */}
        <div className="p-6 pt-0">
          <div className="flex gap-4">
            <motion.button
              className="flex-1 h-14 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-xl flex items-center justify-center gap-2 text-[#0a0a1a] font-bold tracking-wide shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:shadow-none"
              onClick={handleBuyClick}
              disabled={balance <= 1 || isPendingOrder}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <TrendingUp size={18} /> {isPendingOrder ? '处理中...' : '买入 BUY'}
            </motion.button>
            <motion.button
              className="flex-1 h-14 bg-gradient-to-r from-[#ff4466] to-[#ff9933] rounded-xl flex items-center justify-center gap-2 text-white font-bold tracking-wide shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:shadow-none"
              onClick={handleSell}
              disabled={shares <= 0 || isPendingOrder}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <TrendingDown size={18} /> {isPendingOrder ? '处理中...' : '卖出 SELL'}
            </motion.button>
          </div>

          <motion.button
            onClick={handleEarlyExit}
            className="w-full mt-3 h-10 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-xl flex items-center justify-center gap-2 text-[#ffd700] text-sm font-bold"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <LogOut size={14} /> 立即锁定收益
          </motion.button>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-80 border-l border-[#6450c8]/30 flex flex-col bg-[#140a28]/40 backdrop-blur-xl">
        {/* Portfolio */}
        <GlassCard className="m-4 p-4" variant="gold">
          <h3 className="text-[10px] text-[#ffd700] uppercase tracking-widest mb-4 flex items-center gap-2 font-bold">
            <Trophy size={12} className="text-[#ffd700]" /> 资产看板
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-[#ffd700]/20 pb-2">
              <span className="text-xs text-[#a0a0c0]">余额</span>
              <motion.span 
                className="text-sm font-bold text-[#f0e6ff]"
                key={balance}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {balance.toFixed(2)} USDC
              </motion.span>
            </div>

            <div className="flex justify-between items-center border-b border-[#ffd700]/20 pb-2">
              <span className="text-xs text-[#a0a0c0]">持仓</span>
              <span className="text-sm font-bold text-[#00d4ff]">{shares.toFixed(0)} YES</span>
            </div>

            <div className="flex justify-between items-center border-b border-[#ffd700]/20 pb-2">
              <span className="text-xs text-[#a0a0c0]">均价</span>
              <span className="text-sm text-[#f0e6ff]">${avgPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-[#a0a0c0]">盈亏</span>
              <motion.span
                className={`text-xl font-bold ${pnlPercent >= 0 ? 'text-[#00ff88]' : 'text-[#ff4466]'}`}
                key={pnlPercent.toFixed(2)}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
              </motion.span>
            </div>
          </div>
        </GlassCard>

        {/* News Feed */}
        <div className="flex-1 m-4 mt-0 flex flex-col min-h-0">
          <div className="text-[10px] text-[#00d4ff] uppercase tracking-widest mb-2 flex items-center gap-2 px-1 font-bold">
            <Newspaper size={12} className="text-[#00d4ff]" /> 实时情报
          </div>
          <GlassCard className="flex-1 overflow-hidden flex flex-col" variant="cyan">
            <div 
              className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar"
              ref={newsListRef}
            >
              <AnimatePresence>
                {newsFeed.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={`pb-2 border-b border-[#6450c8]/30 last:border-0 ${item.type === 'real' ? 'animate-pulse' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] text-[#a0a0c0] font-mono">{item.time}</span>
                      {item.type === 'real' && (
                        <span className="text-[9px] bg-[#ff4466]/20 text-[#ff4466] px-2 py-0.5 rounded-full font-bold border border-[#ff4466]/50">
                          重要
                        </span>
                      )}
                    </div>
                    <p className={`leading-relaxed ${
                      item.type === 'real' 
                        ? 'text-sm text-[#ff4466] font-bold' 
                        : item.type === 'noise' 
                          ? 'text-[10px] text-[#6450c8]' 
                          : 'text-xs text-[#a0a0c0]'
                    }`}>
                      {blindMode ? '***************' : item.content}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>

        {/* Trade History */}
        <div className="m-4 mt-0">
          <div className="text-[10px] text-[#ff66cc] uppercase tracking-widest mb-2 flex items-center gap-2 px-1 font-bold">
            <Clock size={10} className="text-[#ff66cc]" /> 交易记录
          </div>
          <GlassCard className="p-3 max-h-40 overflow-y-auto">
            {tradeHistory.length === 0 ? (
              <div className="text-[#6450c8] text-[10px] text-center py-4">暂无交易</div>
            ) : (
              <div className="space-y-2">
                {tradeHistory.map(trade => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center text-[10px] font-mono"
                  >
                    <span className={`font-bold ${trade.type === 'BUY' ? 'text-[#00ff88]' : 'text-[#ff4466]'}`}>
                      {trade.type}
                    </span>
                    <span className="text-[#f0e6ff]">${trade.price.toFixed(2)}</span>
                    <span className="text-[#a0a0c0]">{trade.time}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Buy Modal */}
      <AnimatePresence>
        {isBuyModalOpen && (
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0a0a1a]/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <GlassCard className="w-full max-w-md p-6" variant="default">
                <button
                  onClick={handleCancelBuy}
                  className="absolute top-4 right-4 text-[#a0a0c0] hover:text-[#00d4ff] text-xl"
                >
                  x
                </button>

                <h2 className="text-xl font-bold text-[#f0e6ff] mb-6 flex items-center gap-2">
                  <TrendingUp className="text-[#00ff88]" /> 买入 YES
                </h2>

                <div className="mb-6 flex justify-between items-center bg-[#00ff88]/10 p-4 rounded-xl border border-[#00ff88]/30">
                  <span className="text-[#00ff88]">当前价格</span>
                  <span className="text-2xl font-mono font-bold text-[#00ff88]">
                    ${currentPrice.toFixed(2)}
                  </span>
                </div>

                <div className="mb-6 space-y-2">
                  <label className="text-xs text-[#00d4ff] uppercase tracking-widest font-bold">买入金额 (USDC)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0c0]">$</span>
                    <input
                      type="number"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      placeholder="0.00"
                      autoFocus
                      className="w-full bg-[#140a28] border border-[#6450c8]/30 rounded-xl py-3 pl-8 pr-4 text-[#f0e6ff] font-mono text-lg focus:border-[#00d4ff] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/20 transition-all"
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-[#a0a0c0]">可用: ${balance.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={handleCancelBuy}
                    className="flex-1 py-3 bg-[#140a28] text-[#a0a0c0] rounded-xl font-bold border border-[#6450c8]/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    取消
                  </motion.button>
                  <motion.button
                    onClick={() => handleConfirmBuy(buyAmount)}
                    className="flex-1 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-[#0a0a1a] rounded-xl font-bold shadow-lg shadow-green-500/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    确认买入
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Result Component ---
const Result = ({ result, onRestart }: { result: any; onRestart: () => void }) => {
  if (!result) return null;

  const roiVal = parseFloat(result.roi);
  const isProfitable = roiVal > 0;

  let personaTitle = "Unknown";
  let personaSubtitle = "";

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="max-w-md w-full overflow-hidden" variant={isProfitable ? 'blue' : 'danger'}>
          {/* Header gradient */}
          <div className={`h-2 w-full ${isProfitable ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gradient-to-r from-red-400 to-orange-500'}`} />

          <div className="p-8 flex flex-col items-center">
            {/* Status Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-6"
            >
              <span className={`inline-block px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase ${
                isProfitable
                  ? 'border-2 border-green-400 text-green-600 bg-green-50'
                  : 'border-2 border-red-400 text-red-600 bg-red-50'
              }`}>
                {isProfitable ? '盈利' : '亏损'}
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold text-blue-900 text-center mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {personaTitle}
            </motion.h1>
            <p className="text-sm text-blue-500 mb-8 font-medium">{personaSubtitle}</p>

            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-3 gap-3 w-full mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                <span className="text-blue-500 text-[10px] uppercase tracking-wider block mb-1 font-bold">总盈亏</span>
                <span className={`text-lg font-bold font-mono ${parseFloat(result.totalPnL) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(result.totalPnL) >= 0 ? '+' : ''}{result.totalPnL}
                </span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                <span className="text-blue-500 text-[10px] uppercase tracking-wider block mb-1 font-bold">最高回撤</span>
                <span className="text-lg font-bold font-mono text-blue-800">-{result.maxDrawdown}%</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                <span className="text-blue-500 text-[10px] uppercase tracking-wider block mb-1 font-bold">交易次数</span>
                <span className="text-lg font-bold font-mono text-blue-600">{result.totalTrades}</span>
              </div>
            </motion.div>

            {/* Benchmark */}
            <motion.div
              className="w-full bg-gradient-to-br from-amber-50 to-white rounded-xl p-4 border border-amber-200 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="text-[10px] text-amber-600 uppercase tracking-widest mb-3 text-center font-bold">策略对比</h4>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-900 font-bold">你的表现</span>
                  <span className={`font-mono font-bold ${roiVal >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.roi}%</span>
                </div>
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${roiVal >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.abs(roiVal), 100)}%` }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-600">躺平 (Hodl)</span>
                  <span className={`font-mono ${parseFloat(result.hodlRoi) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{result.hodlRoi}%</span>
                </div>
                <div className="w-full h-1 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400"
                    style={{ width: `${Math.min(Math.abs(parseFloat(result.hodlRoi)), 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* AI Roast */}
            <motion.div
              className="w-full bg-blue-50 p-4 rounded-xl border-2 border-dashed border-blue-200 mb-8 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="absolute -top-3 left-4 bg-white px-2 text-xs text-blue-500 font-bold flex items-center gap-1">
                <Sparkles size={12} /> AI 评价
              </div>
              <div className="text-center space-y-2 pt-2">
                <p className="text-blue-900 text-sm font-bold">{`"${result.summary}"`}</p>
                <p className="text-blue-600 text-xs italic">{`"${result.roast}"`}</p>
              </div>
            </motion.div>

            {/* Restart Button */}
            <motion.button
              onClick={onRestart}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold tracking-wide rounded-xl shadow-lg shadow-blue-500/30"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              再来一局
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [appMode, setAppMode] = useState('lobby');
  const [loadingState, setLoadingState] = useState('idle');
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [blindMode, setBlindMode] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const handleSelectScenario = async (scenario: typeof SCENARIOS[0]) => {
    setSelectedScenario(scenario);

    // For demo, skip loading and use mock data
    setAppMode('loading');
    setLoadingState('fetching');

    // Simulate loading
    await new Promise(r => setTimeout(r, 1500));

    const mockData = generateMockData();
    setSimulationData(mockData);
    setLoadingState('ready');
  };

  const handleEnterSim = () => {
    setAppMode('sim');
    setLoadingState('idle');
  };

  const handleSimulationFinish = (data: any) => {
    setResultData(data);
    setTimeout(() => {
      setAppMode('result');
    }, 500);
  };

  const handleRestart = () => {
    setAppMode('lobby');
    setResultData(null);
    setSelectedScenario(null);
  };

  return (
    <div>
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
    </div>
  );
}
