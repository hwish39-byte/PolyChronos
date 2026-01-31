import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  // Safe fallback if dependencies are missing, but ideally they should be present.
  // If twMerge/clsx fail, we can use a simple join: return inputs.filter(Boolean).join(' ');
  try {
    return twMerge(clsx(inputs));
  } catch (e) {
    return inputs.filter(Boolean).join(' ');
  }
}

// Data Processing Helper
export const processTradeData = (rawData) => {
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
