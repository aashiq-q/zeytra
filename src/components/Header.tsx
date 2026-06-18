import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Bell, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useMarketData } from '../contexts/MarketContext';
import { useToast } from '../contexts/ToastContext';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery } = useMarketData();
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
          <button className={styles.iconButton} onClick={() => showToast('Region selection coming soon')} title="Region">
            <Globe size={18} />
          </button>
          <button className={styles.iconButton} onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className={styles.iconButton} onClick={() => showToast('No new notifications')} title="Notifications">
            <Bell size={18} />
          </button>
        </div>
        
        <div className={styles.profileArea}>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>Crypto Trader</span>
            <span className={styles.profileRole}>Pro Account</span>
          </div>
          <img src="https://ui-avatars.com/api/?name=Crypto+Trader&background=c4ed46&color=000" alt="Profile" className={styles.avatar} />
        </div>
      </div>
    </header>
  );
};
