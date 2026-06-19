export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

const API_BASE = 'https://api.coingecko.com/api/v3';
let CACHE: { data: Coin[]; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 60 seconds

export const getMarketData = async (forceRefresh = false): Promise<Coin[]> => {
  // Return cached data if valid and not forcing refresh
  if (!forceRefresh && CACHE && Date.now() - CACHE.timestamp < CACHE_TTL) {
    return CACHE.data;
  }

  try {
    // Fetching top 100 coins with sparkline data for mini charts
    const response = await fetch(`${API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true`);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API Rate Limit Exceeded. Please try again in a minute.');
      }
      throw new Error('Failed to fetch market data');
    }

    const data: Coin[] = await response.json();
    CACHE = { data, timestamp: Date.now() };
    return data;
  } catch (error: any) {
    if (!navigator.onLine || error.message?.includes('fetch') || error.message?.includes('NetworkError')) {
      throw new Error("Whoops! You're offline. Please connect to the Internet before the cryptos escape! 🦖🔌");
    }
    if (CACHE && CACHE.data) {
      return CACHE.data;
    }
    throw error;
  }
};

export interface GlobalData {
  active_cryptocurrencies: number;
  total_market_cap: number;
  total_volume: number;
  market_cap_percentage: {
    btc: number;
    eth: number;
  };
}

export const getGlobalData = async (): Promise<GlobalData | null> => {
  try {
    const response = await fetch(`${API_BASE}/global`);
    if (!response.ok) return null;
    const json = await response.json();
    return {
      active_cryptocurrencies: json.data.active_cryptocurrencies,
      total_market_cap: json.data.total_market_cap.usd,
      total_volume: json.data.total_volume.usd,
      market_cap_percentage: {
        btc: json.data.market_cap_percentage.btc,
        eth: json.data.market_cap_percentage.eth,
      },
    };
  } catch (error) {
    console.error('Failed to fetch global data', error);
    // Dummy fallback data if rate limited
    return {
      active_cryptocurrencies: 13245,
      total_market_cap: 2530000000000,
      total_volume: 112000000000,
      market_cap_percentage: { btc: 52.1, eth: 16.4 },
    };
  }
};
