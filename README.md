# Zeytra | Crypto Market Pulse

**Live Demo:** [https://zeytra.vercel.app](https://zeytra.vercel.app)

![Zeytra Dashboard Preview](./public/dashboard-preview.png)

A high-performance cryptocurrency dashboard designed to track top markets, visualize real-time data, and manage a persistent user watchlist. Built as an interview task to demonstrate modern frontend architecture, UI/UX polish, and performance engineering.

---

## Core Features (User Stories Fulfilled)

* **Live Feed:** The dashboard defaults to showing the top global cryptocurrencies, complete with their current price, 24h change (%), market cap, and a 7-day sparkline chart.
* **Search & Filter:** Users can navigate to the 'Markets' tab to search for specific assets by name or symbol, and dynamically filter the view (Top 10, Top 50, Top 100).
* **Personal Watchlist:** Users can "star" specific assets to save them to a persistent Watchlist that survives browser reloads.
* **Detail View:** Clicking any asset card opens a dedicated modal panel containing extended statistics (24h High/Low, Total Volume) and an interactive, stylized Recharts area graph.
* **Refresh Mechanism:** A dedicated refresh button is available in the top header, allowing users to forcefully update the API data without triggering a hard page reload.

---

## Technical Constraints & Architecture

* **Public API:** The application is powered by the **CoinGecko REST API** for historical data, market caps, and sparkline charts. It is supplemented by the **Binance WebSocket API** to stream real-time live price updates.
* **State Management:** **React Context API** is utilized to cleanly decouple global state (`MarketData`, `Watchlist`, `Theme`) from UI components without introducing the heavy bundle size of Redux.
* **Persistence:** The user's Watchlist and Theme preferences are serialized and stored in `localStorage`, ensuring data persists across browser sessions.
* **Styling & PWA:** Built using **Vanilla CSS Modules** for a strict, isolated styling architecture (Bento box grids, glassmorphism, neon-gradients). The app is fully responsive, defaults to Light Theme with a Dark Mode toggle, and is configured as a **Progressive Web App (PWA)** for offline support.

---

## Architecture Q&A

### 1. Error Handling: How does the app behave if the API limit is reached or the user is offline?
Because public APIs are heavily throttled, the application implements robust error handling:
* **API Limits:** A 60-second in-memory cache intercepts unnecessary network calls. If the rate limit (HTTP 429) is hit, the app catches the error and elegantly displays a fallback UI with a retry mechanism, rather than crashing or showing blank data.
* **Offline Mode (PWA):** A Service Worker caches the entire application shell. If the user loses internet connection, the UI still loads instantly from cache. The app intercepts the network failure and renders a custom, branded full-screen "Offline" page (`"Whoops! You're offline. 🦖🔌"`) instead of the default Chrome Dinosaur.

### 2. Performance: Are you making unnecessary API calls or re-rendering components too often?
Performance and frame-rate optimization was a primary focus of this build:
* **API Calls:** To prevent rate limiting and bandwidth waste, the heavy CoinGecko API is cached and only requested when necessary (or manually refreshed).
* **Render Cycles:** Feeding high-frequency live WebSocket prices into a global React Context would normally force the entire DOM (including heavy SVG charts) to re-render 10 times a second. To bypass this, the render cycle was decoupled. The WebSocket is piped directly into an isolated micro-component (`LivePriceText`). The parent `AssetCard` components are wrapped in `React.memo()`, meaning only the raw text nodes update while the rest of the UI remains frozen, achieving a buttery-smooth 120fps.

### 3. Code Cleanliness: Are your API calls abstracted into a separate service/utility file?
Yes. To maintain strict Separation of Concerns, all external data fetching logic is abstracted away from the UI components. 
* All REST calls, caching logic, and offline error interception are housed in a dedicated `src/services/api.ts` file. 
* All real-time connection logic is abstracted into a Singleton class inside `src/services/ws.ts`. 

---

## Setup Instructions

To run this project locally:

1. **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) installed (v16+ recommended).
2. **Clone the repository:**
   ```bash
   git clone https://github.com/aashiq-q/zeytra.git
   cd zeytra
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. **View the App:** Open your browser and navigate to `http://localhost:5173`.

---

## Trade-offs & Future Improvements

1. **Backend Proxy:** 
   * *Trade-off:* Relying directly on the public CoinGecko API exposes the client to strict IP-based rate limiting. 
   * *Improvement:* If I had more time, I would implement an intermediate Node.js/Express backend server with Redis caching to completely mask the rate limit from the frontend and securely handle an enterprise API key.
2. **Historical Chart Data:**
   * *Trade-off:* The 7-day sparkline charts currently pull standard arrays from the `/markets` endpoint rather than making 100 individual requests to `/market_chart`. This was done to preserve performance and respect rate limits.
   * *Improvement:* With more time, I would implement lazy-loading for the charts. Clicking a coin would trigger a dedicated fetch for high-fidelity historical candle data.
3. **Testing Coverage:**
   * *Trade-off:* Manual and automated linting was heavily utilized to ensure stability, but formal unit testing was bypassed to prioritize architectural setup and UI polish.
   * *Improvement:* I would add Vitest and React Testing Library to write unit tests for the `api.ts` data transformations and the `WatchlistContext` localStorage persistence.
