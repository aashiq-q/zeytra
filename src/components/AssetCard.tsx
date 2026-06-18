import React, { memo } from 'react';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import type { Coin } from '../services/api';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useLivePrice } from '../hooks/useLivePrice';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import styles from './AssetCard.module.css';

interface AssetCardProps {
  coin: Coin;
  onClick: (coin: Coin) => void;
}

export const AssetCard: React.FC<AssetCardProps> = memo(({ coin, onClick }) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { price: livePrice, direction } = useLivePrice(coin.symbol, coin.current_price);
  
  const isStarred = isInWatchlist(coin.id);
  const isPositive = coin.price_change_percentage_24h >= 0;
  const chartColor = isPositive ? 'var(--success)' : 'var(--danger)';
  
  // Recharts needs an array of objects
  const chartData = coin.sparkline_in_7d?.price.map((p, index) => ({ value: p, index })) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 4 : 2,
    }).format(value);
  };

  const flashClass = direction === 'up' ? 'flash-up' : direction === 'down' ? 'flash-down' : '';

  return (
    <div className={styles.card} onClick={() => onClick(coin)}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <img src={coin.image} alt={coin.name} className={styles.icon} loading="lazy" />
          <div className={styles.names}>
            <span className={styles.symbol}>{coin.symbol}</span>
            <span className={styles.name}>{coin.name}</span>
          </div>
        </div>
        <button 
          className={styles.starButton}
          onClick={(e) => {
            e.stopPropagation();
            toggleWatchlist(coin.id);
          }}
          aria-label={isStarred ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Star size={20} className={isStarred ? styles.starActive : ''} />
        </button>
      </div>
      
      <div className={styles.middleSection}>
        <div className={styles.priceArea}>
          <span className={`${styles.price} ${flashClass}`}>{formatCurrency(livePrice)}</span>
          <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
          </div>
        </div>
        
        {chartData.length > 0 && (
          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <YAxis domain={['dataMin', 'dataMax']} hide />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={chartColor} 
                  strokeWidth={2} 
                  dot={false} 
                  isAnimationActive={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
});
