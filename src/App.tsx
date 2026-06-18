import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { MarketProvider } from './contexts/MarketContext';
import { ToastProvider } from './contexts/ToastContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { wsService } from './services/ws';
import './App.css';

export type ViewState = 'dashboard' | 'watchlist' | 'analytics';

function App() {
  const [activeView, setActiveView] = React.useState<ViewState>('dashboard');

  React.useEffect(() => {
    wsService.connect();
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <WatchlistProvider>
          <MarketProvider>
            <div className="app">
              <Sidebar activeView={activeView} onNavigate={setActiveView} />
              <main>
                <Header />
                <Dashboard activeView={activeView} />
              </main>
            </div>
          </MarketProvider>
        </WatchlistProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
