import React, { useEffect } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import type { Coin } from '../services/api';
import { useLivePrice } from '../hooks/useLivePrice';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import styles from './AssetModal.module.css';

interface AssetModalProps {
  coin: Coin | null;
  onClose: () => void;
}

// Custom tooltip for Recharts
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipPrice}>
          ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
        </div>
      </div>
    );
  }
  return null;
};

export const AssetModal: React.FC<AssetModalProps> = ({ coin, onClose }) => {
  useEffect(() => {
    if (coin) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [coin]);

  // Hook must be called unconditionally, but since it depends on coin properties,
  // we can mock the values if coin is null.
  const { price: livePrice, direction } = useLivePrice(
    coin?.symbol || '', 
    coin?.current_price || 0
  );

  if (!coin) return null;

  const isPositive = coin.price_change_percentage_24h >= 0;
  const chartColor = isPositive ? '#10b981' : '#ef4444'; 

  const formatCurrency = (value: number, maxDigits = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: maxDigits,
      minimumFractionDigits: maxDigits,
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return formatCurrency(value, 0);
  };

  const flashClass = direction === 'up' ? 'flash-up' : direction === 'down' ? 'flash-down' : '';
  const chartData = coin.sparkline_in_7d?.price.map((p, i) => ({ value: p, index: i })) || [];

  // Custom tooltip for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', boxShadow: 'var(--card-shadow)' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
            {formatCurrency(payload[0].value, coin.current_price < 1 ? 4 : 2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <img src={coin.image} alt={coin.name} className={styles.icon} />
            <div className={styles.title}>
              <span className={styles.name}>{coin.name}</span>
              <span className={styles.symbol}>{coin.symbol}</span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.priceHeader}>
            <div className={`${styles.currentPrice} ${flashClass}`}>
              {formatCurrency(livePrice, livePrice < 1 ? 4 : 2)}
            </div>
            <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
              {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span>{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={chartColor} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className={styles.grid}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>24h High</span>
              <span className={styles.statValue}>{formatCurrency(coin.high_24h, coin.high_24h < 1 ? 4 : 2)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>24h Low</span>
              <span className={styles.statValue}>{formatCurrency(coin.low_24h, coin.low_24h < 1 ? 4 : 2)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Market Cap</span>
              <span className={styles.statValue}>{formatLargeNumber(coin.market_cap)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Volume (24h)</span>
              <span className={styles.statValue}>{formatLargeNumber(coin.total_volume)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Rank</span>
              <span className={styles.statValue}>#{coin.market_cap_rank}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
