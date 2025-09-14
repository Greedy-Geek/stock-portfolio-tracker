# 📈 Stock Portfolio Tracker

[![GitHub Stars](https://img.shields.io/github/stars/Greedy-Geek/stock-portfolio-tracker?style=social)](https://github.com/Greedy-Geek/stock-portfolio-tracker)
[![GitHub Forks](https://img.shields.io/github/forks/Greedy-Geek/stock-portfolio-tracker?style=social)](https://github.com/Greedy-Geek/stock-portfolio-tracker)
[![GitHub Issues](https://img.shields.io/github/issues/Greedy-Geek/stock-portfolio-tracker)](https://github.com/Greedy-Geek/stock-portfolio-tracker/issues)
[![GitHub License](https://img.shields.io/github/license/Greedy-Geek/stock-portfolio-tracker)](https://github.com/Greedy-Geek/stock-portfolio-tracker/blob/main/LICENSE)

A comprehensive Next.js application for tracking stock portfolios with real-time data integration, supporting both manual stock tracking and live broker portfolio synchronization.

🔗 **GitHub Repository**: [https://github.com/Greedy-Geek/stock-portfolio-tracker](https://github.com/Greedy-Geek/stock-portfolio-tracker)

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/Greedy-Geek/stock-portfolio-tracker.git
cd stock-portfolio-tracker

# Install dependencies
pnpm install

# Set up environment variables
cp env.template .env.local
# Edit .env.local with your API keys

# Run development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your stock portfolio tracker!

## 🌟 Features

### 📊 Portfolio Management

- **Manual Stock Tracking**: Add and monitor individual stocks with real-time prices
- **Zerodha Integration**: Direct connection to your Zerodha Kite portfolio
- **Real-time Data**: Live stock prices from multiple API sources
- **Multi-Exchange Support**: NSE, BSE, NASDAQ, NYSE, and international markets
- **P&L Calculations**: Automatic profit/loss calculations with color coding
- **Portfolio Weights**: View each holding's percentage of total portfolio value for better asset allocation insights
- **Advanced Sorting**: Sort holdings by Weight, P&L, or P&L% in ascending/descending order with visual indicators

### 🎨 User Interface

- **Modern Design**: Clean, responsive interface built with Tailwind CSS
- **Tabbed Navigation**: Separate views for manual stocks and broker portfolios
- **Professional Tables**: Sortable, responsive data tables
- **Loading States**: Skeleton loading and progress indicators
- **Error Handling**: User-friendly error messages and retry options

### 🔒 Security & Performance

- **Secure API Integration**: Environment-based credential management
- **Caching System**: 5-minute intelligent caching for API responses
- **Rate Limiting**: Built-in protection against API abuse
- **Error Recovery**: Fallback mechanisms for API failures

## 🏗️ Architecture

### Frontend (Next.js 14)

```
app/
├── page.tsx                 # Main application page
├── layout.tsx              # Root layout with fonts and analytics
├── globals.css             # Global styles
└── api/                    # API routes
    ├── stock/[ticker]/     # Stock price API endpoint
    └── kite/               # Zerodha Kite API endpoints
        ├── holdings/       # Portfolio holdings
        └── positions/      # Trading positions

components/
├── stock-table.tsx         # Original stock tracking component
├── stock-table-with-kite.tsx # Enhanced component with Kite integration
├── theme-provider.tsx      # Theme management
└── ui/                     # Reusable UI components
    ├── table.tsx
    ├── card.tsx
    ├── button.tsx
    ├── dialog.tsx
    ├── tabs.tsx
    └── ...
```

### Backend APIs

#### Stock Price API (`/api/stock/[ticker]`)

- **Multi-source data fetching**: Alpha Vantage, Yahoo Finance, Polygon
- **Exchange detection**: Automatic parsing of ticker formats
- **Indian market support**: Specialized handling for NSE/BSE stocks
- **Fallback system**: Multiple API sources for reliability
- **Caching**: 5-minute cache to optimize performance

#### Kite Integration (`/api/kite/`)

- **Holdings API**: Fetch real portfolio positions
- **Positions API**: Day and net trading positions
- **Authentication**: Secure token-based access
- **Error handling**: Comprehensive error responses

## 🔧 Technical Stack

### Core Technologies

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Package Manager**: pnpm

### Dependencies

```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x",
  "tailwindcss": "3.x",
  "@radix-ui/react-*": "Latest",
  "lucide-react": "Latest",
  "kiteconnect": "5.1.0"
}
```

### External APIs

- **Alpha Vantage**: Primary stock data source
- **Yahoo Finance**: Fallback and international stocks
- **Polygon.io**: Additional US market data
- **Zerodha Kite Connect**: Indian broker integration

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm package manager
- Zerodha trading account (for portfolio integration)

### Installation

1. **Clone and Install**:

   ```bash
   git clone <repository-url>
   cd stock-table-app
   pnpm install
   ```

2. **Environment Setup**:

   ```bash
   cp env.template .env.local
   ```

3. **Configure API Keys**:

   ```bash
   # .env.local
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   KITE_API_KEY=your_kite_api_key
   KITE_API_SECRET=your_kite_api_secret
   KITE_ACCESS_TOKEN=your_kite_access_token
   ```

4. **Start Development Server**:
   ```bash
   pnpm dev
   ```

### Zerodha Kite Setup

1. **Create Kite App**: Visit [Kite Apps](https://kite.zerodha.com/apps)
2. **Generate Access Token**: Use the provided script
   ```bash
   node generate-kite-token.js
   ```
3. **Update Environment**: Add generated token to `.env.local`

## 📚 API Documentation

### Stock Price Endpoint

**GET** `/api/stock/[ticker]`

**Parameters:**

- `ticker`: Stock symbol (e.g., `AAPL`, `NSE:RELIANCE`, `NASDAQ:GOOGL`)

**Response:**

```json
{
  "ticker": "NSE:RELIANCE",
  "symbol": "RELIANCE",
  "exchange": "NSE",
  "price": 2450.75,
  "source": "Yahoo Finance India",
  "lastUpdated": "2024-01-01T10:30:00Z"
}
```

**Error Response:**

```json
{
  "error": "Stock ticker not found",
  "ticker": "INVALID:TICKER"
}
```

### Kite Holdings Endpoint

**GET** `/api/kite/holdings`

**Headers:**

- Requires valid Kite API credentials in environment

**Response:**

```json
{
  "success": true,
  "holdings": [
    {
      "ticker": "NSE:RELIANCE",
      "symbol": "RELIANCE",
      "exchange": "NSE",
      "quantity": 100,
      "averagePrice": 2400.0,
      "price": 2450.75,
      "value": 245075,
      "pnl": 5075,
      "pnlPercent": 2.11,
      "instrument": "738561",
      "source": "Zerodha Kite",
      "lastUpdated": "2024-01-01T10:30:00Z"
    }
  ],
  "totalValue": 245075,
  "totalPnL": 5075,
  "count": 1
}
```

## 🎯 Component Documentation

### StockTableWithKite Component

**Location**: `components/stock-table-with-kite.tsx`

**Features:**

- Tabbed interface for manual stocks and Kite portfolio
- Real-time price fetching and updates
- Add/edit/delete stock functionality
- Portfolio summary with P&L calculations
- Responsive design with loading states

**State Management:**

```typescript
interface Stock {
  ticker: string;
  symbol?: string;
  exchange?: string;
  price: number;
  loading?: boolean;
  error?: string;
  lastUpdated?: Date;
}

interface KiteHolding {
  ticker: string;
  symbol: string;
  exchange: string;
  price: number;
  quantity: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  averagePrice: number;
  instrument: string;
  source: string;
  lastUpdated: string;
}
```

**Key Functions:**

- `fetchStockPrice()`: Retrieves real-time stock prices
- `handleAddStock()`: Adds new stocks to manual tracking
- `refreshAllPrices()`: Updates all stock prices
- `fetchKiteHoldings()`: Retrieves portfolio from Zerodha

### Currency Symbol Helper

**Function**: `getCurrencySymbol(exchange: string)`

**Purpose**: Maps stock exchanges to appropriate currency symbols

**Supported Exchanges:**

- **Indian**: NSE, BSE, MCX → ₹ (Rupee)
- **US**: NASDAQ, NYSE → $ (Dollar)
- **UK**: LSE, LON → £ (Pound)
- **Europe**: FRA, PAR, AMS → € (Euro)
- **Asia**: TSE, HKG → ¥, HK$ (Yen, HK Dollar)

## 🔄 Data Flow

### Manual Stock Tracking

1. User enters ticker symbol
2. Frontend validates and formats input
3. API call to `/api/stock/[ticker]`
4. Backend tries multiple data sources
5. Response cached for 5 minutes
6. UI updates with price and metadata

### Kite Portfolio Integration

1. User clicks "Fetch Holdings"
2. Frontend calls `/api/kite/holdings`
3. Backend authenticates with Kite API
4. Portfolio data transformed and enriched
5. P&L calculations performed
6. UI displays comprehensive portfolio view

### Error Handling Flow

1. API failures trigger fallback sources
2. Invalid tickers show user-friendly errors
3. Network issues display retry options
4. Token expiration prompts re-authentication

## 🛡️ Security Considerations

### API Security

- Environment variables for sensitive credentials
- No client-side exposure of API keys
- Secure token-based authentication
- Rate limiting and request validation

### Data Privacy

- No persistent storage of user data
- Session-based portfolio access
- Secure HTTPS communication
- No logging of sensitive information

## 🚀 Performance Optimizations

### Caching Strategy

- **API Responses**: 5-minute cache for stock prices
- **Static Assets**: Next.js automatic optimization
- **Component Rendering**: React memo for expensive components

### Loading Optimization

- **Skeleton Loading**: Smooth loading states
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Next.js automatic image handling
- **Bundle Splitting**: Automatic code splitting

## 🧪 Testing

### Manual Testing

- Stock price fetching for various exchanges
- Portfolio integration with real Zerodha data
- Error handling for invalid tickers
- Responsive design across devices

### API Testing

- Multiple stock symbols across exchanges
- Error scenarios and fallback behavior
- Rate limiting and cache behavior
- Authentication flow validation

## 📈 Monitoring & Analytics

### Built-in Analytics

- Vercel Analytics integration
- Performance monitoring
- Error tracking and reporting

### API Monitoring

- Response time tracking
- Success/failure rates
- Cache hit ratios
- Source reliability metrics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. **Fork the repository** on GitHub
2. **Clone your fork**: `git clone https://github.com/YOUR-USERNAME/stock-portfolio-tracker.git`
3. **Create a feature branch**: `git checkout -b feature/amazing-feature`
4. **Make your changes** and test thoroughly
5. **Commit with conventional format**: `git commit -m "feat: add amazing feature"`
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a Pull Request** with a clear description

### Development Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests and linting
pnpm lint
pnpm type-check

# Validate documentation
pnpm docs:check

# Clean up unused files
pnpm cleanup
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⭐ Show Your Support

If this project helped you, please consider giving it a ⭐ on [GitHub](https://github.com/Greedy-Geek/stock-portfolio-tracker)!

## 🔮 Future Enhancements

### Planned Features

- **Portfolio Analytics**: Sector allocation, performance charts
- **Price Alerts**: Configurable notifications
- **Historical Data**: Price history and trends
- **Export Functionality**: CSV/Excel portfolio exports
- **Multi-broker Support**: Upstox, Angel One integration

### Technical Improvements

- **WebSocket Integration**: Real-time price streaming
- **Database Integration**: Persistent user preferences
- **Advanced Caching**: Redis for high-performance caching
- **Mobile App**: React Native companion app

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request

### Code Standards

- TypeScript strict mode
- ESLint and Prettier formatting
- Component documentation
- API endpoint documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Zerodha**: For providing Kite Connect API
- **Alpha Vantage**: For reliable stock market data
- **shadcn/ui**: For beautiful UI components
- **Vercel**: For hosting and analytics platform

---

**Built with ❤️ for stock market enthusiasts**
