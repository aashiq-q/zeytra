export class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(price: number) => void>> = new Map();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          data.forEach(ticker => {
            const symbol = ticker.s; // e.g., BTCUSDT
            const price = parseFloat(ticker.c);
            
            // Only care about USDT pairs to match our USD prices
            if (symbol.endsWith('USDT')) {
              const baseSymbol = symbol.slice(0, -4).toLowerCase();
              if (this.listeners.has(baseSymbol)) {
                this.listeners.get(baseSymbol)?.forEach(callback => callback(price));
              }
            }
          });
        }
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting in 5s...');
      this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket Error', err);
      this.ws?.close();
    };
  }

  subscribe(symbol: string, callback: (price: number) => void) {
    const key = symbol.toLowerCase();
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)?.add(callback);
    
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }
}

export const wsService = new WebSocketService();
