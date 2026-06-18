import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useMarketData } from '../contexts/MarketContext';
import { useToast } from '../contexts/ToastContext';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery, refreshData } = useMarketData();
  const { showToast } = useToast();
  const [inputValue, setInputValue] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue, setSearchQuery]);

  // Clear input if search is cleared externally (e.g. sidebar navigation)
  useEffect(() => {
    if (searchQuery === '') {
      setInputValue('');
    }
  }, [searchQuery]);

  return (
    <header className={styles.header}>
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="text"
          placeholder="Search coin..."
          className={styles.searchInput}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
      
      <div className={styles.actions}>
        <div className={styles.iconGroup}>
          <button 
            className={styles.iconButton} 
            onClick={() => {
              refreshData();
              showToast('Market data refreshed!');
            }} 
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
          <button className={styles.iconButton} onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        
        <div className={styles.profileArea}>
          <div className={styles.profileInfo} style={{ alignItems: 'flex-end' }}>
            <span className={styles.profileName} style={{ fontSize: '0.875rem' }}>Live Market Feed</span>
            <span className={styles.profileRole} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Connected</span>
          </div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-color)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent)', 
              animation: 'pulseStatus 2s infinite',
              boxShadow: '0 0 10px var(--accent)'
            }} />
          </div>
        </div>
        <style>{`
          @keyframes pulseStatus {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.8; }
          }
        `}</style>
      </div>
    </header>
  );
};
