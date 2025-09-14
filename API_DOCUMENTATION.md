# 🔌 API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the Stock Portfolio Tracker application, including request/response formats, error handling, and usage examples.

## Base URLs

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication

### Environment Variables Required

```bash
# Stock Data APIs
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# Zerodha Kite API
KITE_API_KEY=your_kite_api_key
KITE_API_SECRET=your_kite_api_secret
KITE_ACCESS_TOKEN=your_kite_access_token
```

## 📈 Stock Price API

### Get Stock Price

Retrieves real-time stock price data for a given ticker symbol.

**Endpoint**: `GET /api/stock/[ticker]`

#### Parameters

| Parameter | Type   | Required | Description                                     |
| --------- | ------ | -------- | ----------------------------------------------- |
| `ticker`  | string | Yes      | Stock ticker symbol (supports multiple formats) |

#### Supported Ticker Formats

| Format          | Example        | Description                       |
| --------------- | -------------- | --------------------------------- |
| Symbol only     | `AAPL`         | US stock (auto-detected)          |
| Exchange:Symbol | `NSE:RELIANCE` | Indian stock on NSE               |
| Exchange:Symbol | `NASDAQ:GOOGL` | US stock on NASDAQ                |
| Exchange:Symbol | `BSE:TCS`      | Indian stock on BSE               |
| Exchange:Symbol | `LON:VODL`     | UK stock on London Stock Exchange |

#### Request Examples

```bash
# US Stock
curl "http://localhost:3000/api/stock/AAPL"

# Indian Stock (NSE)
curl "http://localhost:3000/api/stock/NSE:RELIANCE"

# Indian Stock (BSE)
curl "http://localhost:3000/api/stock/BSE:TCS"

# International Stock
curl "http://localhost:3000/api/stock/NASDAQ:GOOGL"
```

#### Success Response

**Status Code**: `200 OK`

```json
{
  "ticker": "NSE:RELIANCE",
  "symbol": "RELIANCE",
  "exchange": "NSE",
  "price": 2450.75,
  "source": "Yahoo Finance India",
  "lastUpdated": "2024-01-15T10:30:00.000Z",
  "currency": "INR"
}
```

#### Response Fields

| Field         | Type   | Description                                           |
| ------------- | ------ | ----------------------------------------------------- |
| `ticker`      | string | Full ticker as requested                              |
| `symbol`      | string | Stock symbol without exchange                         |
| `exchange`    | string | Stock exchange identifier                             |
| `price`       | number | Current stock price                                   |
| `source`      | string | Data source used (Alpha Vantage, Yahoo Finance, etc.) |
| `lastUpdated` | string | ISO timestamp of last update                          |
| `currency`    | string | Currency code (USD, INR, GBP, etc.)                   |

#### Error Responses

**Invalid Ticker Format**

**Status Code**: `400 Bad Request`

```json
{
  "error": "Invalid ticker format. Use formats like 'AAPL' or 'NASDAQ:AAPL'.",
  "ticker": "INVALID_FORMAT"
}
```

**Stock Not Found**

**Status Code**: `404 Not Found`

```json
{
  "error": "Stock ticker not found. Please check the symbol and try again.",
  "ticker": "NSE:NONEXISTENT"
}
```

**API Service Error**

**Status Code**: `500 Internal Server Error`

```json
{
  "error": "Failed to fetch stock price",
  "details": "All data sources unavailable",
  "ticker": "NSE:RELIANCE"
}
```

#### Data Sources and Fallback Logic

The API uses multiple data sources with intelligent fallback:

1. **Alpha Vantage** (Primary)

   - US and international stocks
   - Indian stocks with `.NS`/`.BO` suffixes
   - Real-time and demo modes

2. **Yahoo Finance** (Fallback)

   - Global stock coverage
   - Indian stocks with `.NS`/`.BO` suffixes
   - Real-time data

3. **Polygon.io** (Fallback)

   - US stocks only
   - Demo mode available

4. **NSE API** (Indian Stocks)
   - Direct NSE data
   - May have CORS limitations

#### Caching

- **Cache Duration**: 5 minutes
- **Cache Key**: Ticker symbol
- **Cache Behavior**: Returns cached data if available and not expired

#### Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Response Header**: `X-RateLimit-Remaining`
- **Reset Header**: `X-RateLimit-Reset`

## 🏦 Kite Holdings API

### Get Portfolio Holdings

Retrieves portfolio holdings from Zerodha Kite account.

**Endpoint**: `GET /api/kite/holdings`

#### Request

```bash
curl "http://localhost:3000/api/kite/holdings"
```

#### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "holdings": [
    {
      "ticker": "NSE:RELIANCE",
      "symbol": "RELIANCE",
      "exchange": "NSE",
      "price": 2450.75,
      "quantity": 100,
      "value": 245075,
      "pnl": 5075,
      "pnlPercent": 2.11,
      "averagePrice": 2400.0,
      "instrument": "738561",
      "source": "Zerodha Kite",
      "lastUpdated": "2024-01-15T10:30:00.000Z",
      "weight": 61.0,
      "marketCap": 1650000000000,
      "sector": "Oil & Gas"
    },
    {
      "ticker": "NSE:TCS",
      "symbol": "TCS",
      "exchange": "NSE",
      "price": 3134.05,
      "quantity": 50,
      "value": 156702.5,
      "pnl": -3297.5,
      "pnlPercent": -1.03,
      "averagePrice": 3200.0,
      "instrument": "2953217",
      "source": "Zerodha Kite",
      "lastUpdated": "2024-01-15T10:30:00.000Z",
      "weight": 39.0,
      "marketCap": 1200000000000,
      "sector": "Information Technology"
    }
  ],
  "totalValue": 401777.5,
  "totalPnL": 1777.5,
  "count": 2
}
```

#### Response Fields

| Field        | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| `success`    | boolean | Request success status      |
| `holdings`   | array   | Array of portfolio holdings |
| `totalValue` | number  | Total portfolio value       |
| `totalPnL`   | number  | Total profit/loss           |
| `count`      | number  | Number of holdings          |

#### Holdings Object Fields

| Field          | Type   | Description                                |
| -------------- | ------ | ------------------------------------------ |
| `ticker`       | string | Full ticker (exchange:symbol)              |
| `symbol`       | string | Stock symbol                               |
| `exchange`     | string | Exchange identifier                        |
| `price`        | number | Current market price                       |
| `quantity`     | number | Number of shares held                      |
| `value`        | number | Total position value (price × quantity)    |
| `pnl`          | number | Profit/Loss in currency                    |
| `pnlPercent`   | number | Profit/Loss percentage                     |
| `averagePrice` | number | Average purchase price                     |
| `instrument`   | string | Kite instrument token                      |
| `source`       | string | Data source identifier                     |
| `lastUpdated`  | string | ISO timestamp                              |
| `weight`       | number | Portfolio weight percentage (0-100)        |
| `marketCap`    | number | Market capitalization in rupees (optional) |
| `sector`       | string | Industry sector (optional)                 |

#### Error Responses

**API Credentials Not Configured**

**Status Code**: `400 Bad Request`

```json
{
  "error": "Kite API credentials not configured. Please set KITE_API_KEY and KITE_ACCESS_TOKEN in your environment variables.",
  "setup_required": true
}
```

**Invalid or Expired Access Token**

**Status Code**: `401 Unauthorized`

```json
{
  "error": "Invalid or expired access token. Please regenerate your Kite access token.",
  "token_expired": true
}
```

**Network Error**

**Status Code**: `503 Service Unavailable`

```json
{
  "error": "Unable to connect to Zerodha servers. Please try again later.",
  "network_error": true
}
```

## 🏦 Kite Positions API

### Get Trading Positions

Retrieves current trading positions from Zerodha Kite account.

**Endpoint**: `GET /api/kite/positions`

#### Request

```bash
curl "http://localhost:3000/api/kite/positions"
```

#### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "positions": {
    "day": [
      {
        "ticker": "NSE:INFY",
        "symbol": "INFY",
        "exchange": "NSE",
        "price": 1525.6,
        "quantity": 10,
        "netQuantity": 10,
        "value": 15256,
        "pnl": 256,
        "unrealizedPnl": 256,
        "realizedPnl": 0,
        "averagePrice": 1500.0,
        "buyQuantity": 10,
        "sellQuantity": 0,
        "product": "CNC",
        "instrument": "408065",
        "positionType": "day",
        "source": "Zerodha Kite",
        "lastUpdated": "2024-01-15T10:30:00.000Z"
      }
    ],
    "net": [
      {
        "ticker": "NSE:INFY",
        "symbol": "INFY",
        "exchange": "NSE",
        "price": 1525.6,
        "quantity": 10,
        "netQuantity": 10,
        "value": 15256,
        "pnl": 256,
        "unrealizedPnl": 256,
        "realizedPnl": 0,
        "averagePrice": 1500.0,
        "buyQuantity": 10,
        "sellQuantity": 0,
        "product": "CNC",
        "instrument": "408065",
        "positionType": "net",
        "source": "Zerodha Kite",
        "lastUpdated": "2024-01-15T10:30:00.000Z"
      }
    ]
  },
  "summary": {
    "dayPnL": 256,
    "netPnL": 256,
    "totalValue": 15256
  },
  "count": {
    "day": 1,
    "net": 1
  }
}
```

## 🔄 Common Response Headers

All API responses include these headers:

```http
Content-Type: application/json
Cache-Control: public, s-maxage=300, stale-while-revalidate=300
X-Response-Time: 150ms
X-Data-Source: Alpha Vantage | Yahoo Finance | Zerodha Kite
```

## 📊 Status Codes

| Code  | Status                | Description                       |
| ----- | --------------------- | --------------------------------- |
| `200` | OK                    | Request successful                |
| `400` | Bad Request           | Invalid request parameters        |
| `401` | Unauthorized          | Invalid or expired authentication |
| `404` | Not Found             | Resource not found                |
| `429` | Too Many Requests     | Rate limit exceeded               |
| `500` | Internal Server Error | Server error                      |
| `503` | Service Unavailable   | External service unavailable      |

## 🚀 Usage Examples

### JavaScript/TypeScript

```typescript
// Fetch stock price
async function getStockPrice(ticker: string) {
  try {
    const response = await fetch(`/api/stock/${ticker}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching stock price:", error);
    throw error;
  }
}

// Fetch Kite holdings
async function getKiteHoldings() {
  try {
    const response = await fetch("/api/kite/holdings");
    const data = await response.json();

    if (!response.ok) {
      if (data.setup_required) {
        throw new Error("Kite API setup required");
      }
      if (data.token_expired) {
        throw new Error("Access token expired");
      }
      throw new Error(data.error || "Failed to fetch holdings");
    }

    return data;
  } catch (error) {
    console.error("Error fetching Kite holdings:", error);
    throw error;
  }
}

// Usage examples
const stockData = await getStockPrice("NSE:RELIANCE");
const portfolio = await getKiteHoldings();
```

### React Hook Example

```typescript
import { useState, useEffect } from "react";

interface Stock {
  ticker: string;
  price: number;
  error?: string;
}

function useStockPrice(ticker: string) {
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;

    setLoading(true);
    setError(null);

    fetch(`/api/stock/${ticker}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setStock(data);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ticker]);

  return { stock, loading, error };
}

// Usage in component
function StockDisplay({ ticker }: { ticker: string }) {
  const { stock, loading, error } = useStockPrice(ticker);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stock) return null;

  return (
    <div>
      <h3>{stock.ticker}</h3>
      <p>Price: ${stock.price}</p>
    </div>
  );
}
```

### Python Example

```python
import requests
import json

class StockAPI:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url

    def get_stock_price(self, ticker):
        """Fetch stock price for given ticker"""
        url = f"{self.base_url}/api/stock/{ticker}"

        try:
            response = requests.get(url)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching stock price: {e}")
            return None

    def get_kite_holdings(self):
        """Fetch Kite portfolio holdings"""
        url = f"{self.base_url}/api/kite/holdings"

        try:
            response = requests.get(url)
            data = response.json()

            if not response.ok:
                if data.get('setup_required'):
                    raise Exception("Kite API setup required")
                if data.get('token_expired'):
                    raise Exception("Access token expired")
                raise Exception(data.get('error', 'Failed to fetch holdings'))

            return data
        except requests.exceptions.RequestException as e:
            print(f"Error fetching Kite holdings: {e}")
            return None

# Usage
api = StockAPI()
stock_data = api.get_stock_price("NSE:RELIANCE")
portfolio = api.get_kite_holdings()

if stock_data:
    print(f"RELIANCE: ₹{stock_data['price']}")

if portfolio:
    print(f"Total Portfolio Value: ₹{portfolio['totalValue']:,.2f}")
    print(f"Total P&L: ₹{portfolio['totalPnL']:,.2f}")
```

## 🔍 Testing

### Manual Testing

```bash
# Test stock price API
curl -X GET "http://localhost:3000/api/stock/AAPL" \
  -H "Accept: application/json"

# Test with invalid ticker
curl -X GET "http://localhost:3000/api/stock/INVALID" \
  -H "Accept: application/json"

# Test Kite holdings
curl -X GET "http://localhost:3000/api/kite/holdings" \
  -H "Accept: application/json"
```

### Automated Testing

```javascript
// Jest test example
describe("Stock API", () => {
  test("should return stock price for valid ticker", async () => {
    const response = await fetch("/api/stock/AAPL");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("ticker");
    expect(data).toHaveProperty("price");
    expect(typeof data.price).toBe("number");
  });

  test("should return error for invalid ticker", async () => {
    const response = await fetch("/api/stock/INVALID");
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty("error");
  });
});
```

## 🛡️ Security Considerations

### API Key Security

- Store API keys in environment variables only
- Never expose keys in client-side code
- Rotate keys regularly
- Use different keys for development/production

### Rate Limiting

- Implement per-IP rate limiting
- Monitor for unusual usage patterns
- Use caching to reduce API calls
- Set appropriate timeout values

### Input Validation

- Validate ticker symbols format
- Sanitize all user inputs
- Prevent injection attacks
- Limit request payload sizes

## 📈 Performance Tips

### Caching Strategy

- Use appropriate cache TTL (5 minutes for stock prices)
- Implement cache warming for popular stocks
- Use CDN for static responses
- Monitor cache hit rates

### Optimization

- Batch multiple stock requests when possible
- Use connection pooling for external APIs
- Implement request deduplication
- Monitor API response times

This comprehensive API documentation provides all the information needed to integrate with the Stock Portfolio Tracker APIs effectively and securely.
