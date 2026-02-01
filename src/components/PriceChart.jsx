
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine } from 'recharts';

const PriceChart = ({ data, currentIndex, children }) => {
  const WINDOW_SIZE = 300; 
  const HALF_WINDOW = WINDOW_SIZE / 2;

  const { visibleData, backgroundData, currentPoint, xDomain } = useMemo(() => {
    if (!data || data.length === 0) return { visibleData: [], backgroundData: [], currentPoint: null, xDomain: [-HALF_WINDOW, HALF_WINDOW] };
    
    // Calculate centered X domain
    const minX = currentIndex - HALF_WINDOW;
    const maxX = currentIndex + HALF_WINDOW;
    
    // Prepare background data (future + past within window)
    // We need to slice data that falls within [minX, maxX]
    // Since data indices are 0, 1, 2..., we can map them directly
    const startIdx = Math.max(0, Math.floor(minX));
    const endIdx = Math.min(data.length, Math.ceil(maxX));
    
    const bgData = data.slice(startIdx, endIdx).map((d, i) => ({
      ...d,
      x: startIdx + i
    }));

    // Prepare visible data (past only, up to current)
    const floorIndex = Math.floor(currentIndex);
    const fraction = currentIndex - floorIndex;
    
    // Only slice visible part that is also within the window
    const visibleStartIdx = Math.max(0, Math.floor(minX));
    // We go up to floorIndex
    const visibleBaseData = data.slice(visibleStartIdx, floorIndex + 1).map((d, i) => ({
      ...d,
      x: visibleStartIdx + i
    }));

    // Calculate interpolated point
    const p1 = data[floorIndex];
    const p2 = data[floorIndex + 1];
    
    let interpolatedPoint = null;
    let finalVisibleData = visibleBaseData;

    if (p1) {
       interpolatedPoint = { ...p1, x: floorIndex, simTime: floorIndex, price: p1.price };
       
       if (p2) {
          const interpolatedPrice = p1.price + (p2.price - p1.price) * fraction;
          interpolatedPoint = {
            ...p1,
            price: interpolatedPrice,
            simTime: currentIndex,
            x: currentIndex
          };
          // Append interpolated point to visible line so it connects smoothly
          finalVisibleData = [...visibleBaseData, interpolatedPoint];
       } else {
          // End of data
          interpolatedPoint = { ...p1, x: floorIndex, simTime: floorIndex };
       }
    }

    return {
      visibleData: finalVisibleData,
      backgroundData: bgData,
      currentPoint: interpolatedPoint,
      xDomain: [minX, maxX]
    };
  }, [data, currentIndex]);

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <XAxis 
            type="number" 
            dataKey="x" 
            domain={xDomain} 
            hide={true}
            allowDataOverflow={true}
          />
          <YAxis 
            domain={[0.45, 0.85]} 
            hide={true} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#3b82f6' }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, '价格']}
            labelFormatter={(label) => new Date(label * 1000).toLocaleTimeString()}
          />
          
          {/* Reference Line for 50% Probability */}
          <ReferenceLine y={0.5} stroke="#666" strokeDasharray="3 3" opacity={0.5} />

          {/* Background Line (Future/History context) */}
          <Line 
            data={backgroundData}
            type="monotone" 
            dataKey="price" 
            stroke="#475569" 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false} 
          />

          {/* Main Price Line (Progress) */}
          <Line 
            data={visibleData}
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={false} 
            isAnimationActive={false} 
          />
          
          {/* Playhead / Current Point */}
          {currentPoint && (
            <ReferenceDot
              x={currentPoint.x}
              y={currentPoint.price}
              r={6}
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth={2}
              style={{ filter: 'url(#glow)' }}
            />
          )}

          {children}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
