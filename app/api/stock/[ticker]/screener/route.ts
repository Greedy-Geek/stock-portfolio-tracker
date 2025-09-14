import { NextRequest, NextResponse } from "next/server";

// Cache for screener data (24 hours)
const screenerCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface ScreenerData {
  marketCap?: number;
  sector?: string;
  error?: string;
}

async function fetchFromScreener(symbol: string): Promise<ScreenerData> {
  try {
    // Screener.in URL format: https://www.screener.in/api/company/RELIANCE/
    const url = `https://www.screener.in/api/company/${symbol.toUpperCase()}/`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StockPortfolioTracker/1.0)",
        Accept: "application/json",
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      marketCap: data.market_cap ? parseFloat(data.market_cap) : undefined,
      sector: data.sector || undefined,
    };
  } catch (error) {
    console.error(`Error fetching screener data for ${symbol}:`, error);
    return { error: `Failed to fetch data from Screener.in` };
  }
}

async function fetchFromAlternativeSource(
  symbol: string
): Promise<ScreenerData> {
  try {
    // Alternative: Try Yahoo Finance API as fallback
    const url = `https://query1.finance.yahoo.com/v1/finance/quoteType/${symbol}.NS`;

    const response = await fetch(url, {
      timeout: 8000,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const quote = data.quoteType?.result?.[0];

    if (quote) {
      return {
        marketCap: quote.marketCap,
        sector: quote.sector,
      };
    }

    return { error: "No data found" };
  } catch (error) {
    console.error(`Error fetching alternative data for ${symbol}:`, error);
    return { error: "Alternative source failed" };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const ticker = params.ticker;

    // Extract symbol from ticker (handle NSE:SYMBOL format)
    const symbol = ticker.includes(":") ? ticker.split(":")[1] : ticker;

    // Check cache first
    const cacheKey = symbol.toLowerCase();
    const cached = screenerCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        symbol,
        ...cached.data,
        source: "cache",
      });
    }

    // Try Screener.in first
    let result = await fetchFromScreener(symbol);

    // If Screener.in fails, try alternative source
    if (result.error) {
      console.log(`Screener.in failed for ${symbol}, trying alternative...`);
      result = await fetchFromAlternativeSource(symbol);
    }

    // Cache the result (even if it's an error, to avoid repeated failures)
    screenerCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          symbol,
          error: result.error,
          marketCap: null,
          sector: "Unknown",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      symbol,
      marketCap: result.marketCap || null,
      sector: result.sector || "Unknown",
      source: "screener",
    });
  } catch (error) {
    console.error("Error in screener API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        marketCap: null,
        sector: "Unknown",
      },
      { status: 500 }
    );
  }
}
