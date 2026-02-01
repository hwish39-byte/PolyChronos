import React, { useMemo } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Trophy, TrendingUp, TrendingDown, Activity, Share2, RefreshCw, AlertTriangle, Crown } from 'lucide-react';
import { MEDAL_CONTRACT_ADDRESS, MEDAL_CONTRACT_ABI } from '../constants/medal';
import { cn } from '../lib/utils';

// --- Animated Background (Same as Lobby/Terminal for consistency) ---
const AnimatedBackground = () => {
  const stars = useMemo(() => 
    [...Array(60)].map((_, i) => ({
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#140a28] to-[#0a0a1a]" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#6450c8] rounded-full blur-[150px] opacity-20 animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#ff4466] rounded-full blur-[150px] opacity-15 animate-pulse" style={{ animationDelay: '2s' }} />
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
    success: 'bg-gradient-to-br from-[#0a1a2a]/80 to-[#140a28]/70 border-[#00ff9d]/30 shadow-lg shadow-green-900/20',
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

// --- Stat Item Component ---
const StatItem = ({ label, value, subValue, type = 'neutral', icon: Icon }) => {
  const colors = {
    neutral: 'text-[#a0a0c0]',
    positive: 'text-[#00ff9d]',
    negative: 'text-[#ff4466]',
    gold: 'text-[#ffd700]',
  };

  return (
    <div className="flex flex-col items-center p-3 bg-[#0a0a1a]/40 rounded-lg border border-[#6450c8]/20">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className={cn("w-3.5 h-3.5", colors[type])} />}
        <span className="text-xs uppercase tracking-wider text-[#a0a0c0]">{label}</span>
      </div>
      <div className={cn("text-lg font-bold font-mono", colors[type])}>
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-[#a0a0c0]/70 font-mono">
          {subValue}
        </div>
      )}
    </div>
  );
};

const Result = ({ result, onRestart }) => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
      hash,
  });

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

  // Medal Logic - Based on Persona Title
  const getMedalData = (title) => {
      if (title === '佛系路人') return { name: '佛系路人', uri: '/medals/medal_1.json', img: '/medals/1.png' };
      if (title === '慈善赌王') return { name: '慈善赌王', uri: '/medals/medal_2.json', img: '/medals/2.png' };
      if (title === '韭菜') return { name: '韭菜', uri: '/medals/medal_3.json', img: '/medals/3.png' };
      if (title === '保本大师') return { name: '保本大师', uri: '/medals/medal_4.json', img: '/medals/4.png' };
      if (title === '顺势交易员') return { name: '顺势交易员', uri: '/medals/medal_5.json', img: '/medals/5.png' };
      if (title === '华尔街之狼') return { name: '华尔街之狼', uri: '/medals/medal_6.json', img: '/medals/6.png' };
      return { name: '时间旅行者', uri: '/medals/medal_7.json', img: '/medals/7.png' };
  };

  const medal = getMedalData(personaTitle);

  const handleMint = () => {
      if (!address) return;
      const fullUri = window.location.origin + medal.uri;
      
      writeContract({
          address: MEDAL_CONTRACT_ADDRESS,
          abi: MEDAL_CONTRACT_ABI,
          functionName: 'mintMedal',
          args: [address, fullUri],
      });
  };

  return (
    <div className="h-screen font-sans flex items-center justify-center p-4 relative overflow-hidden text-[#e0e0e0]">
      <AnimatedBackground />
      
      <div className="w-full max-w-2xl relative z-10 perspective-1000">
        <GlassCard 
          className="overflow-hidden flex flex-col items-center animate-in fade-in zoom-in duration-500 max-h-[95vh]"
          variant={isProfitable ? 'default' : 'danger'}
        >
          {/* Header Strip */}
          <div className={cn(
            "w-full h-1.5 absolute top-0 left-0",
            isProfitable ? "bg-gradient-to-r from-[#00ff9d] to-[#00d4ff]" : "bg-gradient-to-r from-[#ff4466] to-[#ff9900]"
          )} />

          <div className="p-8 w-full flex flex-col items-center relative h-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#6450c8]/20">
            
            {/* Wallet Info Badge */}
            {isConnected && address && (
              <div className="absolute top-4 right-4 text-xs font-mono text-[#a0a0c0] bg-[#0a0a1a]/50 px-2 py-1 rounded border border-[#6450c8]/30">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}

            {/* Result Title */}
            <div className="mb-4 text-center mt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a0a1a]/40 border border-[#6450c8]/20 mb-2">
                <Trophy className="w-3 h-3 text-[#ffd700]" />
                <span className="text-xs font-bold tracking-widest uppercase text-[#a0a0c0]">战报</span>
              </div>
              <h1 className={cn(
                "text-4xl font-black tracking-tight mb-1 drop-shadow-lg",
                isProfitable ? "text-[#00ff9d]" : "text-[#ff4466]"
              )}>
                {isProfitable ? '盈利' : '爆仓'}
              </h1>
              <p className="text-sm text-[#a0a0c0] font-medium">{personaTitle}</p>
            </div>

            {/* Medal Showcase */}
            <div className="relative mb-6 group cursor-pointer perspective-500">
              <div className={cn(
                "absolute inset-0 blur-2xl rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-500",
                isProfitable ? "bg-[#00ff9d]" : "bg-[#ff4466]"
              )} />
              <div className="relative w-24 h-24 transform group-hover:scale-110 group-hover:rotate-y-12 transition-transform duration-500">
                <img 
                  src={medal.img} 
                  alt={medal.name} 
                  className="w-full h-full object-contain drop-shadow-2xl" 
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="px-2.5 py-1 bg-[#0a0a1a]/80 border border-[#ffd700]/30 rounded-full text-xs font-bold text-[#ffd700] shadow-lg backdrop-blur-sm">
                  {medal.name}
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 w-full mb-6">
              <StatItem 
                icon={TrendingUp}
                label="盈亏" 
                value={`${isProfitable ? '+' : ''}${parseFloat(result.totalPnL).toLocaleString()}`} 
                type={isProfitable ? 'positive' : 'negative'}
              />
              <StatItem 
                icon={AlertTriangle}
                label="回撤" 
                value={`-${result.maxDrawdown}%`} 
                type="neutral"
              />
              <StatItem 
                icon={Activity}
                label="交易次数" 
                value={result.totalTrades} 
                type="neutral"
              />
            </div>

            {/* AI Analysis (Roast) */}
            <div className="w-full bg-[#0a0a1a]/30 rounded-xl p-4 border border-[#6450c8]/20 mb-6 relative group">
              <div className="absolute -top-2.5 left-4 px-2 bg-[#140a28] text-xs font-bold text-[#6450c8] border border-[#6450c8]/30 rounded flex items-center gap-1.5">
                <Crown className="w-3 h-3" /> AI 锐评
              </div>
              <p className="text-base font-medium text-[#e0e0e0] text-center italic leading-relaxed opacity-90 mt-2">
                "{result.summary}"
              </p>
              <div className="w-12 h-[1px] bg-[#6450c8]/30 mx-auto my-3" />
              <p className="text-sm text-[#a0a0c0] text-center font-mono leading-relaxed">
                {result.roast}
              </p>
            </div>

            {/* Action Area */}
            <div className="w-full space-y-3 mt-auto">
              {isConnected ? (
                <>
                  {isConfirmed ? (
                    <div className="w-full py-2.5 bg-[#00ff9d]/10 border border-[#00ff9d]/30 rounded-xl flex flex-col items-center justify-center gap-1 animate-in slide-in-from-bottom-2">
                      <span className="text-[#00ff9d] text-sm font-bold flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5" /> 铸造成功!
                      </span>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${hash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#00ff9d]/70 hover:text-[#00ff9d] underline transition-colors"
                      >
                        查看区块浏览器
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={handleMint}
                      disabled={isWritePending || isConfirming}
                      className="w-full group relative overflow-hidden py-3 bg-gradient-to-r from-[#6450c8] to-[#ff4466] hover:from-[#7c66e3] hover:to-[#ff6685] text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isWritePending || isConfirming ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> 铸造中...
                          </>
                        ) : (
                          <>
                            <Trophy className="w-4 h-4" /> 铸造勋章 (NFT)
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="p-2.5 bg-[#6450c8]/10 border border-[#6450c8]/30 rounded-xl text-center">
                    <p className="text-xs text-[#6450c8] font-bold mb-2">连接钱包以铸造成就</p>
                    <div className="flex justify-center">
                      <ConnectButton showBalance={false} chainStatus="none" />
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={onRestart}
                className="w-full py-3 bg-[#0a0a1a]/40 hover:bg-[#0a0a1a]/60 text-[#a0a0c0] hover:text-white font-medium rounded-xl border border-[#6450c8]/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" /> 再来一次
              </button>
            </div>

          </div>
        </GlassCard>
        
        {/* Footer */}
        <div className="mt-4 text-center">
           <p className="text-xs text-[#a0a0c0]/50 font-mono uppercase tracking-widest">
             PolyChronos v0.1 • {new Date().toLocaleDateString()}
           </p>
        </div>
      </div>
    </div>
  );
};

export default Result;
