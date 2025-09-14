import { NextRequest, NextResponse } from "next/server";
import { KiteConnect } from "kiteconnect";

// Initialize Kite Connect with API credentials from environment variables
const kite = new KiteConnect({
  api_key: process.env.KITE_API_KEY || "",
});

export async function GET(request: NextRequest) {
  try {
    // Check if required environment variables are set
    if (!process.env.KITE_API_KEY || !process.env.KITE_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          error:
            "Kite API credentials not configured. Please set KITE_API_KEY and KITE_ACCESS_TOKEN in your environment variables.",
          setup_required: true,
        },
        { status: 400 }
      );
    }

    // Set access token
    kite.setAccessToken(process.env.KITE_ACCESS_TOKEN);

    // Fetch user's holdings
    const holdings = await kite.getHoldings();

    // Transform holdings data to match our stock interface
    const transformedHoldings = holdings.map((holding: any) => ({
      ticker: `NSE:${holding.tradingsymbol}`, // Most Zerodha stocks are NSE
      symbol: holding.tradingsymbol,
      exchange: "NSE",
      price: holding.last_price || holding.average_price,
      quantity: holding.quantity,
      value: holding.last_price * holding.quantity,
      pnl: holding.pnl,
      pnlPercent:
        ((holding.last_price - holding.average_price) / holding.average_price) *
        100,
      averagePrice: holding.average_price,
      instrument: holding.instrument_token,
      source: "Zerodha Kite",
      lastUpdated: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      holdings: transformedHoldings,
      totalValue: transformedHoldings.reduce(
        (sum: number, holding: any) => sum + holding.value,
        0
      ),
      totalPnL: transformedHoldings.reduce(
        (sum: number, holding: any) => sum + holding.pnl,
        0
      ),
      count: transformedHoldings.length,
    });
  } catch (error: any) {
    console.error("Kite API Error:", error);

    // Handle specific Kite API errors
    if (error.message?.includes("TokenException")) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired access token. Please regenerate your Kite access token.",
          token_expired: true,
        },
        { status: 401 }
      );
    }

    if (error.message?.includes("NetworkException")) {
      return NextResponse.json(
        {
          error:
            "Unable to connect to Zerodha servers. Please try again later.",
          network_error: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch portfolio holdings from Zerodha Kite",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
