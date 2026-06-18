import React from 'react';
import { LayoutDashboard, Star, TrendingUp, BarChart2, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useMarketData } from '../contexts/MarketContext';
import type { ViewState } from '../App';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const { showToast } = useToast();
  const { setSearchQuery } = useMarketData();

  const handleNav = (view: ViewState) => {
    setSearchQuery('');
    onNavigate(view);
  };

  return (
    <aside className={styles.sidebar}>
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
          <li className={`${styles.navItem} ${activeView === 'watchlist' ? styles.active : ''}`} onClick={() => handleNav('watchlist')}>
            <Star className={styles.navIcon} size={18} />
            Watchlist
          </li>
          <li className={`${styles.navItem} ${activeView === 'analytics' ? styles.active : ''}`} onClick={() => handleNav('analytics')}>
            <BarChart2 className={styles.navIcon} size={18} />
            Analytics
          </li>
        </ul>
      </div>

      <div className={styles.navGroup}>
        <div className={styles.navTitle}>General</div>
        <ul className={styles.navList}>
          <li className={styles.navItem} onClick={() => showToast('Settings panel opening soon...')}>
            <Settings className={styles.navIcon} size={18} />
            Settings
          </li>
          <li className={styles.navItem} onClick={() => showToast('Help Center is currently offline')}>
            <HelpCircle className={styles.navIcon} size={18} />
            Help
          </li>
          <li className={styles.navItem} onClick={() => showToast('You are already logged out of Pro')}>
            <LogOut className={styles.navIcon} size={18} />
            Logout
          </li>
        </ul>
      </div>

      <div className={styles.promoCard}>
        <div className={styles.promoGlow}></div>
        <div className={styles.promoContent}>
          <span className={styles.promoTitle}>Download our<br/>Mobile App</span>
          <button className={styles.promoButton} onClick={() => showToast('A download link was sent to your device!')}>Download</button>
        </div>
      </div>
    </aside>
  );
};
