import React, { useMemo, useState } from 'react';
import { ArrowUpRight, TrendingDown } from 'lucide-react';
import { useMarketData } from '../contexts/MarketContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import { AssetCard } from './AssetCard';
import { AssetModal } from './AssetModal';
import type { Coin } from '../services/api';
import type { ViewState } from '../App';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import styles from './Dashboard.module.css';

interface DashboardProps {
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ activeView, onNavigate }) => {
  const { coins, globalData, loading, searchQuery, error, refreshData } = useMarketData();
  const { watchlist } = useWatchlist();
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [marketFilter, setMarketFilter] = useState<number>(10);

  // Memoize sorted coins for the markets view
  const sortedMarkets = useMemo(() => {
    return [...coins].sort((a,b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
  }, [coins]);

  const topGainer = useMemo(() => {
    if (coins.length === 0) return null;
    return [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)[0];
  }, [coins]);

  const formatLarge = (val: number | undefined) => {
    if (!val) return '0';
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    return `$${(val / 1e6).toFixed(2)}M`;
  };

  const barChartData = useMemo(() => {
    return coins.slice(0, 7).map(c => ({
      name: c.symbol.toUpperCase(),
      volume: c.total_volume,
    }));
  }, [coins]);

  const donutData = useMemo(() => {
    if (!globalData) return [];
    return [
      { name: 'BTC', value: globalData.market_cap_percentage.btc, color: '#c4ed46' },
      { name: 'ETH', value: globalData.market_cap_percentage.eth, color: '#171a1f' },
      { name: 'Others', value: 100 - globalData.market_cap_percentage.btc - globalData.market_cap_percentage.eth, color: '#e5e7eb' },
    ];
  }, [globalData]);

  if (error && coins.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', gap: '1rem' }}>
        <h2 style={{ color: 'var(--danger)', fontSize: '1.5rem', fontWeight: 600 }}>API Error</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>{error}</p>
        <button 
          onClick={() => refreshData()} 
          style={{ background: 'var(--accent)', color: '#000', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '1rem' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading && coins.length === 0) return null;

  // ROUTING OVERRIDES
  if (searchQuery) {
    const filteredCoins = coins.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
      <div style={{ marginTop: '1rem' }}>
        <h2 className={styles.cardTitle}>Search Results for "{searchQuery}"</h2>
        <div className={styles.bentoGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {filteredCoins.map(coin => (
            <AssetCard key={coin.id} coin={coin} onClick={setSelectedCoin} />
          ))}
          {filteredCoins.length === 0 && <p style={{color: 'var(--text-secondary)'}}>No coins found.</p>}
        </div>
        {selectedCoin && <AssetModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />}
      </div>
    );
  }

  if (activeView === 'watchlist') {
    const watchlistCoins = coins.filter(c => watchlist.includes(c.id));
    return (
      <div style={{ marginTop: '1rem' }}>
        <h2 className={styles.cardTitle}>Your Watchlist</h2>
        <div className={styles.bentoGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {watchlistCoins.map(coin => (
            <AssetCard key={coin.id} coin={coin} onClick={setSelectedCoin} />
          ))}
          {watchlistCoins.length === 0 && <p style={{color: 'var(--text-secondary)'}}>You haven't starred any coins yet.</p>}
        </div>
        {selectedCoin && <AssetModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />}
      </div>
    );
  }

  if (activeView === 'markets') {
    const displayedCoins = sortedMarkets.slice(0, marketFilter);

    return (
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className={styles.cardTitle} style={{ margin: 0 }}>All Markets</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setMarketFilter(10)}
              style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', backgroundColor: marketFilter === 10 ? 'var(--text-primary)' : 'var(--bg-color)', color: marketFilter === 10 ? 'var(--bg-card)' : 'var(--text-secondary)' }}
            >
              Top 10
            </button>
            <button 
              onClick={() => setMarketFilter(50)}
              style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', backgroundColor: marketFilter === 50 ? 'var(--text-primary)' : 'var(--bg-color)', color: marketFilter === 50 ? 'var(--bg-card)' : 'var(--text-secondary)' }}
            >
              Top 50
            </button>
            <button 
              onClick={() => setMarketFilter(100)}
              style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', backgroundColor: marketFilter === 100 ? 'var(--text-primary)' : 'var(--bg-color)', color: marketFilter === 100 ? 'var(--bg-card)' : 'var(--text-secondary)' }}
            >
              Top 100
            </button>
          </div>
        </div>
        <div className={styles.bentoGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {displayedCoins.map(coin => (
            <AssetCard key={coin.id} coin={coin} onClick={setSelectedCoin} />
          ))}
          {displayedCoins.length === 0 && <p style={{color: 'var(--text-secondary)'}}>No coins available.</p>}
        </div>
        {selectedCoin && <AssetModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />}
      </div>
    );
  }



  // DEFAULT DASHBOARD VIEW
  return (
    <div>
      <div className={styles.dashboardHeader}>
        <div className={styles.titleArea}>
          <h1>Dashboard</h1>
          <p>Track, analyze, and manage your crypto portfolio with ease</p>
        </div>
      </div>

      <div className={styles.bentoGrid}>
        <div className={`${styles.card} ${styles.cardGreen}`}>
          <div className={styles.kpiTitle}>
            <span>24h Top Gainer</span>
            <div className={styles.kpiIcon}><ArrowUpRight size={14} /></div>
          </div>
          <div className={styles.kpiValue} style={{ fontSize: '1.5rem' }}>
            {topGainer?.name} ({topGainer?.symbol.toUpperCase()})
          </div>
          <div className={styles.kpiSubtitle} style={{ fontWeight: 600 }}>
            <ArrowUpRight size={12} /> {topGainer?.price_change_percentage_24h.toFixed(2)}% Increased today
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.kpiTitle}>
            <span>Global Market Cap</span>
            <div className={styles.kpiIcon}><ArrowUpRight size={14} /></div>
          </div>
          <div className={styles.kpiValue}>{formatLarge(globalData?.total_market_cap)}</div>
          <div className={styles.kpiSubtitle}>
            <TrendingDown size={12} style={{ color: 'var(--danger)' }} /> -1.2% Decreased
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.kpiTitle}>
            <span>24h Global Volume</span>
            <div className={styles.kpiIcon}><ArrowUpRight size={14} /></div>
          </div>
          <div className={styles.kpiValue}>{formatLarge(globalData?.total_volume)}</div>
          <div className={styles.kpiSubtitle}>
            <ArrowUpRight size={12} style={{ color: 'var(--success)' }} /> 5.4% Increased
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.kpiTitle}>
            <span>Active Cryptos</span>
            <div className={styles.kpiIcon}><ArrowUpRight size={14} /></div>
          </div>
          <div className={styles.kpiValue}>{globalData?.active_cryptocurrencies.toLocaleString() || '0'}</div>
          <div className={styles.kpiSubtitle}>Tracking active markets</div>
        </div>
      </div>

      <div className={styles.middleRow}>
        <div className={`${styles.card} ${styles.chartCard}`}>
          <div className={styles.cardTitle}>Volume Analytics (Top 7)</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="volume" radius={[4, 4, 4, 4]}>
                {barChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--accent)' : 'var(--text-primary)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`${styles.card} ${styles.listCard}`}>
          <div className={styles.cardTitle}>Your Watchlist</div>
          <ul>
            {coins.filter(c => watchlist.includes(c.id)).slice(0, 4).map(coin => (
              <li key={coin.id} className={styles.listItem}>
                <div className={styles.listInfo}>
                  <img src={coin.image} alt={coin.symbol} className={styles.listAvatar} />
                  <div>
                    <div className={styles.listName}>{coin.name}</div>
                    <div className={styles.listSub}>{coin.symbol.toUpperCase()}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: coin.price_change_percentage_24h >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
              </li>
            ))}
            {watchlist.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No coins tracked.</p>
            )}
          </ul>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={`${styles.card} ${styles.listCard}`}>
          <div className={styles.cardTitle}>Top Movers</div>
          <ul>
            {coins.slice().sort((a,b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 4).map(coin => (
              <li key={`mover-${coin.id}`} className={styles.listItem}>
                <div className={styles.listInfo}>
                  <img src={coin.image} alt={coin.symbol} className={styles.listAvatar} />
                  <div>
                    <div className={styles.listName}>{coin.name}</div>
                    <div className={styles.listSub}>Rank #{coin.market_cap_rank}</div>
                  </div>
                </div>
                <div className={styles.listBadge} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                  +{coin.price_change_percentage_24h.toFixed(2)}%
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.card} style={{ position: 'relative' }}>
          <div className={styles.cardTitle}>Market Dominance</div>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutCenter}>
              <div className={styles.donutValue}>{globalData?.market_cap_percentage.btc.toFixed(1)}%</div>
              <div className={styles.donutLabel}>BTC Dominance</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            {donutData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.color }}></span>
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.card} ${styles.darkAura}`} style={{ cursor: 'pointer' }} onClick={() => onNavigate('markets')}>
          <div className={styles.auraGlow}></div>
          <h3 style={{ zIndex: 1, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Explore All Markets</h3>
          <p style={{ zIndex: 1, fontSize: '0.75rem', opacity: 0.8, marginBottom: '1.5rem' }}>
            Browse the full directory of top cryptocurrencies and discover new assets.
          </p>
          <button className={styles.primaryButton} style={{ zIndex: 1, pointerEvents: 'none' }}>View Markets</button>
        </div>
      </div>

      {selectedCoin && <AssetModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />}
    </div>
  );
};
