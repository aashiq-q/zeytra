import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMarketData, getGlobalData } from '../services/api';
import type { GlobalData } from '../services/api';
import type { Coin } from '../services/api';

interface MarketContextType {
  coins: Coin[];
  globalData: GlobalData | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refreshData: () => Promise<void>;
  lastUpdated: Date | null;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setLoading(true);
      }
      setError(null);
      
      const [coinsData, global] = await Promise.all([
        getMarketData(forceRefresh),
        getGlobalData()
      ]);
      
      setCoins(coinsData);
      setGlobalData(global);
      setLastUpdated(new Date());
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = async () => {
    await fetchData(true);
  };

  return (
    <MarketContext.Provider value={{
      coins,
      globalData,
      loading,
      error,
      searchQuery,
      setSearchQuery,
      refreshData,
      lastUpdated
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketProvider');
  }
  return context;
};
