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

export type ViewState = 'dashboard' | 'markets' | 'watchlist';

function App() {
  const [activeView, setActiveView] = React.useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    wsService.connect();
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <WatchlistProvider>
          <MarketProvider>
            <div className="app">
              <Sidebar activeView={activeView} onNavigate={setActiveView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
              <main>
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <Dashboard activeView={activeView} onNavigate={setActiveView} />
              </main>
            </div>
          </MarketProvider>
        </WatchlistProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
