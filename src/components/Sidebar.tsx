import React from 'react';
import { LayoutDashboard, Star, Globe, TrendingUp } from 'lucide-react';
import { useMarketData } from '../contexts/MarketContext';
import type { ViewState } from '../App';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, isOpen, onClose }) => {
  const { setSearchQuery } = useMarketData();

  const handleNav = (view: ViewState) => {
    setSearchQuery('');
    onNavigate(view);
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && <div className={styles.sidebarOverlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <TrendingUp className={styles.logoIcon} size={32} />
          ZEYTRA
        </div>

      <div className={styles.navGroup}>
        <div className={styles.navTitle}>Menu</div>
        <ul className={styles.navList}>
          <li className={`${styles.navItem} ${activeView === 'dashboard' ? styles.active : ''}`} onClick={() => handleNav('dashboard')}>
            <LayoutDashboard className={styles.navIcon} size={18} />
            Dashboard
          </li>
          <li className={`${styles.navItem} ${activeView === 'markets' ? styles.active : ''}`} onClick={() => handleNav('markets')}>
            <Globe className={styles.navIcon} size={18} />
            Markets
          </li>
          <li className={`${styles.navItem} ${activeView === 'watchlist' ? styles.active : ''}`} onClick={() => handleNav('watchlist')}>
            <Star className={styles.navIcon} size={18} />
            Watchlist
          </li>
        </ul>
      </div>
    </aside>
    </>
  );
};
