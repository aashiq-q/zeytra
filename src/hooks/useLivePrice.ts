import { useState, useEffect, useRef } from 'react';
import { wsService } from '../services/ws';

export function useLivePrice(symbol: string, initialPrice: number) {
  const [price, setPrice] = useState(initialPrice);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with initialPrice if it changes significantly (e.g. forced refresh)
  useEffect(() => {
    setPrice(initialPrice);
  }, [initialPrice]);

  useEffect(() => {
    const unsubscribe = wsService.subscribe(symbol, (newPrice) => {
      setPrice(prev => {
        if (prev !== newPrice) {
          setDirection(newPrice > prev ? 'up' : 'down');
          
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          // Flash effect lasts for 1 second
          timerRef.current = setTimeout(() => setDirection(null), 1000);
        }
        return newPrice;
      });
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [symbol]);

  return { price, direction };
}
