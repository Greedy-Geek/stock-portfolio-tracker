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

    // Fetch user's positions
    const positions = await kite.getPositions();

    // Transform positions data (both day and net positions)
    const transformPositions = (positionList: any[], type: string) => {
      return positionList.map((position: any) => ({
        ticker: `NSE:${position.tradingsymbol}`, // Most Zerodha stocks are NSE
        symbol: position.tradingsymbol,
        exchange: position.exchange,
        price: position.last_price,
        quantity: position.quantity,
        netQuantity: position.net_quantity,
        value: position.last_price * Math.abs(position.quantity),
        pnl: position.pnl,
        unrealizedPnl: position.unrealised,
        realizedPnl: position.realised,
        averagePrice: position.average_price,
        buyQuantity: position.buy_quantity,
        sellQuantity: position.sell_quantity,
        product: position.product,
        instrument: position.instrument_token,
        positionType: type,
        source: "Zerodha Kite",
        lastUpdated: new Date().toISOString(),
      }));
    };

    const dayPositions = transformPositions(positions.day || [], "day");
    const netPositions = transformPositions(positions.net || [], "net");

    return NextResponse.json({
      success: true,
      positions: {
        day: dayPositions,
        net: netPositions,
      },
      summary: {
        dayPnL: dayPositions.reduce(
          (sum: number, pos: any) => sum + pos.pnl,
          0
        ),
        netPnL: netPositions.reduce(
          (sum: number, pos: any) => sum + pos.pnl,
          0
        ),
        totalValue: netPositions.reduce(
          (sum: number, pos: any) => sum + pos.value,
          0
        ),
      },
      count: {
        day: dayPositions.length,
        net: netPositions.length,
      },
    });
  } catch (error: any) {
    console.error("Kite Positions API Error:", error);

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
        error: "Failed to fetch positions from Zerodha Kite",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
