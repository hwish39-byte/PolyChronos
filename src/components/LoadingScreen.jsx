import React, { useMemo } from 'react';
import { Activity, Database, Radio, Server, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

// --- Animated Background ---
const AnimatedBackground = () => {
  const stars = useMemo(() => 
    [...Array(40)].map((_, i) => ({
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
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00d4ff] rounded-full blur-[150px] opacity-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#6450c8] rounded-full blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
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

const LoadingScreen = ({ status, onEnter }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center font-sans text-[#e0e0e0]">
            <AnimatedBackground />
            
            <div className="relative z-10 flex flex-col items-center gap-10 max-w-md w-full p-8">
                
                {/* Central Loader Construction */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Outer Rings */}
                    <div className={cn(
                        "absolute inset-0 rounded-full border-2 border-transparent border-t-[#00d4ff]/50 border-r-[#00d4ff]/30",
                        status === 'fetching' ? "animate-spin" : ""
                    )} style={{ animationDuration: '3s' }} />
                    
                    <div className={cn(
                        "absolute inset-4 rounded-full border-2 border-transparent border-b-[#6450c8]/50 border-l-[#6450c8]/30",
                        status === 'fetching' ? "animate-spin" : ""
                    )} style={{ animationDuration: '2s', animationDirection: 'reverse' }} />

                    {/* Core Icon */}
                    <div className="relative z-10 p-4 bg-[#0a0a1a]/80 backdrop-blur-md rounded-full border border-[#ffffff]/10 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
                        {status === 'ready' ? (
                            <ShieldCheck className="w-10 h-10 text-[#00ff9d] animate-in zoom-in duration-500" />
                        ) : (
                            <Database className="w-10 h-10 text-[#00d4ff] animate-pulse" />
                        )}
                    </div>
                    
                    {/* Scanning Effect */}
                    {status === 'fetching' && (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00d4ff]/10 to-transparent animate-scan" 
                             style={{ backgroundSize: '100% 200%' }} />
                    )}
                </div>

                {/* Status Text Area */}
                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            status === 'ready' ? "bg-[#00ff9d] shadow-[0_0_10px_#00ff9d]" : "bg-[#ffd700] animate-pulse"
                        )} />
                        <span className="text-xs font-bold tracking-[0.2em] text-[#a0a0c0] uppercase">
                            {status === 'fetching' ? 'System Initializing' : 'Ready to Launch'}
                        </span>
                    </div>
                    
                    <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">
                        {status === 'fetching' ? 'SYNCING DATA' : 'SYSTEM READY'}
                    </h2>
                    
                    <p className="text-sm text-[#a0a0c0] font-mono h-6">
                        {status === 'fetching' ? (
                            <span className="flex items-center gap-2 justify-center">
                                <Activity className="w-3 h-3 animate-bounce" /> 
                                Retrieving Chain Snapshot...
                            </span>
                        ) : (
                            <span className="text-[#00ff9d] flex items-center gap-2 justify-center">
                                <Zap className="w-3 h-3" /> 
                                Simulation Environment Loaded
                            </span>
                        )}
                    </p>
                </div>

                {/* Enter Button */}
                <div className="h-16 w-full flex justify-center items-end">
                    {status === 'ready' && (
                        <button 
                            onClick={onEnter}
                            className="group relative w-full max-w-[200px] py-4 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-[#00d4ff] hover:text-white font-bold tracking-[0.2em] uppercase rounded-xl border border-[#00d4ff]/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:scale-105 active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Enter <Server className="w-4 h-4" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                    )}
                </div>

                {/* Footer Decor */}
                <div className="absolute bottom-8 text-[10px] text-[#555] font-mono tracking-widest uppercase">
                    Secure Connection • PolyChronos Node v1.0
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;