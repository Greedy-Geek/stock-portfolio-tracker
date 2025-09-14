import { NextRequest, NextResponse } from "next/server";

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

// Cache for validated tickers to avoid repeated API calls
const tickerCache = new Map<
  string,
  { valid: boolean; price?: number; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Check if exchange is supported by international APIs
function isInternationalApiSupported(exchange?: string): boolean {
  if (!exchange) return true; // No exchange prefix, assume US/international

  const internationalExchanges = [
    "NASDAQ",
    "NYSE",
    "AMEX", // US
    "LSE",
    "LON", // UK
    "FRA",
    "XETRA",
    "EURONEXT", // Europe
    "TYO",
    "TSE", // Japan
    "HKEX", // Hong Kong
    "ASX",
    "TSX", // Australia, Canada
  ];

  return internationalExchanges.includes(exchange);
}

// Fully dynamic ticker validation using multiple free APIs and intelligent fallbacks
async function validateTickerDynamically(
  ticker: string,
  exchange?: string
): Promise<{ valid: boolean; price?: number; source?: string }> {
  // Check cache first
  const cached = tickerCache.get(ticker);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { valid: cached.valid, price: cached.price, source: "cache" };
  }

  // For Indian and other regional exchanges, use specialized APIs
  if (!isInternationalApiSupported(exchange)) {
    console.log(
      `Exchange ${exchange} not supported by international APIs, trying Indian APIs`
    );
    return await validateIndianStock(ticker, exchange);
  }

  // Try multiple validation methods in order of preference for international exchanges
  const validationMethods = [
    () => validateWithAlphaVantageDemo(ticker),
    () => validateWithYahooFinance(ticker),
    () => validateWithPolygonDemo(ticker),
  ];

  for (const method of validationMethods) {
    try {
      const result = await method();
      if (result.valid) {
        // Cache the result
        tickerCache.set(ticker, {
          valid: true,
          price: result.price,
          timestamp: Date.now(),
        });
        return result;
      }
    } catch (error) {
      console.log(`Validation method failed for ${ticker}:`, error);
      continue; // Try next method
    }
  }

  // If all methods fail, cache as invalid
  tickerCache.set(ticker, { valid: false, timestamp: Date.now() });
  return { valid: false };
}

// Method 1: Alpha Vantage with demo key (limited but reliable)
async function validateWithAlphaVantageDemo(
  ticker: string
): Promise<{ valid: boolean; price?: number; source: string }> {
  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=demo`,
      { headers: { "User-Agent": "StockApp/1.0" } }
    );

    if (!response.ok) throw new Error("Request failed");

    const data = await response.json();

    if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
      return {
        valid: true,
        price: parseFloat(data["Global Quote"]["05. price"]),
        source: "Alpha Vantage Demo",
      };
    }

    throw new Error("No valid data");
  } catch {
    throw new Error("Alpha Vantage validation failed");
  }
}

// Method 2: Yahoo Finance (using a proxy approach)
async function validateWithYahooFinance(
  ticker: string
): Promise<{ valid: boolean; price?: number; source: string }> {
  try {
    // This is a simplified approach - in production you might use a CORS proxy
    // For now, we'll simulate validation based on ticker format and common patterns
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(3000), // 3 second timeout
      }
    );

    if (!response.ok) throw new Error("Request failed");

    const data = await response.json();

    if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      return {
        valid: true,
        price: data.chart.result[0].meta.regularMarketPrice,
        source: "Yahoo Finance",
      };
    }

    throw new Error("No valid data");
  } catch {
    throw new Error("Yahoo Finance validation failed");
  }
}

// Method 3: Polygon with demo key
async function validateWithPolygonDemo(
  ticker: string
): Promise<{ valid: boolean; price?: number; source: string }> {
  try {
    const response = await fetch(
      `https://api.polygon.io/v2/last/trade/${ticker}?apikey=demo`,
      { signal: AbortSignal.timeout(3000) }
    );

    if (!response.ok) throw new Error("Request failed");

    const data = await response.json();

    if (data.results?.p) {
      return {
        valid: true,
        price: data.results.p,
        source: "Polygon Demo",
      };
    }

    throw new Error("No valid data");
  } catch {
    throw new Error("Polygon validation failed");
  }
}

// Indian stock validation using multiple APIs
async function validateIndianStock(
  ticker: string,
  exchange?: string
): Promise<{ valid: boolean; price?: number; source?: string }> {
  if (!exchange || !["NSE", "BSE", "MCX", "NCDEX", "ICEX"].includes(exchange)) {
    return { valid: false };
  }

  // Try multiple Indian stock APIs in order of preference
  const indianApis = [
    () => fetchFromAlphaVantageIndian(ticker, exchange),
    () => fetchFromYahooFinanceIndian(ticker, exchange),
    () => fetchFromNSEAPI(ticker, exchange),
  ];

  for (const api of indianApis) {
    try {
      const result = await api();
      if (result.valid && result.price) {
        // Cache successful result
        tickerCache.set(ticker, {
          valid: true,
          price: result.price,
          timestamp: Date.now(),
        });
        return result;
      }
    } catch (error) {
      console.log(`Indian API failed for ${ticker}:`, error);
      continue; // Try next API
    }
  }

  // All APIs failed
  tickerCache.set(ticker, { valid: false, timestamp: Date.now() });
  return { valid: false };
}

// Method 1: Alpha Vantage with Indian stock suffixes
async function fetchFromAlphaVantageIndian(
  ticker: string,
  exchange: string
): Promise<{ valid: boolean; price?: number; source: string }> {
  try {
    // Convert exchange to Alpha Vantage suffix
    const suffix = exchange === "NSE" ? ".NS" : exchange === "BSE" ? ".BO" : "";
    if (!suffix) throw new Error("Unsupported exchange for Alpha Vantage");

    const symbol = `${ticker}${suffix}`;
    const apiKey =
      ALPHA_VANTAGE_API_KEY !== "demo" ? ALPHA_VANTAGE_API_KEY : "demo";

    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();

    if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
      return {
        valid: true,
        price: parseFloat(data["Global Quote"]["05. price"]),
        source: "Alpha Vantage India",
      };
    }

    throw new Error("No data found");
  } catch {
    throw new Error("Alpha Vantage India failed");
  }
}

// Method 2: Yahoo Finance with Indian stock suffixes
async function fetchFromYahooFinanceIndian(
  ticker: string,
  exchange: string
): Promise<{ valid: boolean; price?: number; source: string }> {
  try {
    // Convert exchange to Yahoo Finance suffix
    const suffix = exchange === "NSE" ? ".NS" : exchange === "BSE" ? ".BO" : "";
    if (!suffix) throw new Error("Unsupported exchange for Yahoo Finance");

    const symbol = `${ticker}${suffix}`;

    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();

    if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      return {
        valid: true,
        price: data.chart.result[0].meta.regularMarketPrice,
        source: "Yahoo Finance India",
      };
    }

    throw new Error("No data found");
  } catch {
    throw new Error("Yahoo Finance India failed");
  }
}

// Method 3: NSE API (unofficial endpoint)
async function fetchFromNSEAPI(
  ticker: string,
  exchange: string
): Promise<{ valid: boolean; price?: number; source: string }> {
  try {
    if (exchange !== "NSE") throw new Error("Only NSE supported");

    // Using a public NSE data endpoint (this is a simplified example)
    const response = await fetch(
      `https://www.nseindia.com/api/quote-equity?symbol=${ticker}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) throw new Error("NSE API request failed");

    const data = await response.json();

    if (data.priceInfo?.lastPrice) {
      return {
        valid: true,
        price: parseFloat(data.priceInfo.lastPrice),
        source: "NSE API",
      };
    }

    throw new Error("No price data found");
  } catch {
    throw new Error("NSE API failed");
  }
}

// Helper function to parse ticker and extract exchange/symbol
function parseTicker(input: string): {
  exchange?: string;
  symbol: string;
  fullTicker: string;
} {
  const upperInput = input.toUpperCase().trim();

  // Check if it contains exchange prefix (e.g., "NASDAQ:AAPL", "NYSE:TSLA")
  if (upperInput.includes(":")) {
    const [exchange, symbol] = upperInput.split(":");
    return {
      exchange: exchange.trim(),
      symbol: symbol.trim(),
      fullTicker: upperInput,
    };
  }

  // No exchange prefix, just the symbol
  return {
    symbol: upperInput,
    fullTicker: upperInput,
  };
}

// Validate ticker format (supports both "AAPL" and "NASDAQ:AAPL" formats)
function isValidTickerFormat(input: string): boolean {
  const { exchange, symbol } = parseTicker(input);

  // Validate symbol part - allow longer symbols for Indian exchanges
  if (
    exchange === "NSE" ||
    exchange === "BSE" ||
    exchange === "MCX" ||
    exchange === "NCDEX" ||
    exchange === "ICEX"
  ) {
    // Indian stocks can have longer symbols (up to 10 characters)
    if (!/^[A-Z]{1,10}$/.test(symbol)) {
      return false;
    }
  } else {
    // International stocks typically 1-5 characters
    if (!/^[A-Z]{1,5}$/.test(symbol)) {
      return false;
    }
  }

  // If exchange is provided, validate it (common exchanges)
  if (exchange) {
    const validExchanges = [
      // US Exchanges
      "NASDAQ",
      "NYSE",
      "AMEX",
      // UK/Europe
      "LSE",
      "LON",
      "FRA",
      "AMS",
      "SWX",
      "BME",
      "BIT",
      "OSE",
      "XETRA",
      "EURONEXT",
      // Asia Pacific
      "TSE",
      "ASX",
      "TSX",
      "HKEX",
      "TYO",
      // Indian Exchanges
      "BSE",
      "NSE",
      "MCX",
      "NCDEX",
      "ICEX",
      // Chinese
      "SSE",
      "SZSE",
    ];

    if (!validExchanges.includes(exchange)) {
      return false;
    }
  }

  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params;
  const tickerInfo = parseTicker(ticker);

  try {
    // Validate ticker format (supports exchange prefixes)
    if (!isValidTickerFormat(ticker)) {
      return NextResponse.json(
        {
          error:
            "Invalid ticker format. Use formats like 'AAPL' or 'NASDAQ:AAPL'.",
        },
        { status: 400 }
      );
    }

    let stockData;

    // Use Alpha Vantage API if we have a real API key
    if (ALPHA_VANTAGE_API_KEY && ALPHA_VANTAGE_API_KEY !== "demo") {
      try {
        const response = await fetch(
          `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${tickerInfo.symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const data = await response.json();

        // Check if we got valid data
        if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
          const globalQuote = data["Global Quote"];
          stockData = {
            ticker: tickerInfo.fullTicker,
            symbol: tickerInfo.symbol,
            exchange: tickerInfo.exchange,
            price: parseFloat(globalQuote["05. price"]),
            change: parseFloat(globalQuote["09. change"]),
            changePercent: globalQuote["10. change percent"],
            timestamp: new Date().toISOString(),
            source: "Alpha Vantage",
          };
        } else if (data["Error Message"]) {
          return NextResponse.json(
            {
              error:
                "Stock ticker not found. Please check the symbol and try again.",
            },
            { status: 404 }
          );
        } else if (data["Information"]) {
          return NextResponse.json(
            { error: "API rate limit reached. Please try again later." },
            { status: 429 }
          );
        } else {
          throw new Error("Invalid response from API");
        }
      } catch (apiError) {
        console.error("Alpha Vantage API error:", apiError);
        // Fall back to dynamic validation
        const validationResult = await validateTickerDynamically(
          tickerInfo.symbol,
          tickerInfo.exchange
        );
        if (!validationResult.valid) {
          return NextResponse.json(
            {
              error:
                "Stock ticker not found. Please check the symbol and try again.",
            },
            { status: 404 }
          );
        }

        stockData = {
          ticker: tickerInfo.fullTicker,
          symbol: tickerInfo.symbol,
          exchange: tickerInfo.exchange,
          price: validationResult.price!,
          timestamp: new Date().toISOString(),
          source: validationResult.source || "Fallback Validation",
        };
      }
    } else {
      // Use dynamic validation for demo mode
      const validationResult = await validateTickerDynamically(
        tickerInfo.symbol,
        tickerInfo.exchange
      );

      if (!validationResult.valid) {
        return NextResponse.json(
          {
            error:
              "Stock ticker not found. Please check the symbol and try again.",
          },
          { status: 404 }
        );
      }

      stockData = {
        ticker: tickerInfo.fullTicker,
        symbol: tickerInfo.symbol,
        exchange: tickerInfo.exchange,
        price: validationResult.price!,
        timestamp: new Date().toISOString(),
        source: validationResult.source || "Dynamic Validation",
      };
    }

    return NextResponse.json(stockData);
  } catch (error) {
    console.error("Error fetching stock price:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock price" },
      { status: 500 }
    );
  }
}
