"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, RefreshCw, Wallet, TrendingUp, AlertTriangle } from "lucide-react"

// TypeScript interface for stock data
export interface Stock {
  ticker: string
  symbol?: string
  exchange?: string
  price: number
  loading?: boolean
  error?: string
  lastUpdated?: Date
}

// TypeScript interface for Kite holdings data
export interface KiteHolding {
  ticker: string
  symbol: string
  exchange: string
  price: number
  quantity: number
  value: number
  pnl: number
  pnlPercent: number
  averagePrice: number
  instrument: string
  source: string
  lastUpdated: string
  weight: number
}

// TypeScript interface for Kite API response
export interface KiteHoldingsResponse {
  success: boolean
  holdings: KiteHolding[]
  totalValue: number
  totalPnL: number
  count: number
  error?: string
  setup_required?: boolean
  token_expired?: boolean
}

// Helper function to get currency symbol based on exchange
const getCurrencySymbol = (exchange?: string): string => {
  switch (exchange) {
    case "NSE":
    case "BSE":
    case "MCX":
    case "NCDEX":
    case "ICEX":
      return "₹"; // Indian Rupee
    case "LSE":
    case "LON":
      return "£"; // British Pound
    case "TSE":
    case "TYO":
      return "¥"; // Japanese Yen
    case "FRA":
    case "PAR":
    case "AMS":
    case "BRU":
    case "MIL":
    case "MAD":
      return "€"; // Euro
    case "HKG":
      return "HK$"; // Hong Kong Dollar
    case "ASX":
      return "A$"; // Australian Dollar
    case "TSX":
      return "C$"; // Canadian Dollar
    default:
      return "$"; // US Dollar (default)
  }
};

export function StockTableWithKite() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [kiteHoldings, setKiteHoldings] = useState<KiteHolding[]>([])
  const [kiteLoading, setKiteLoading] = useState(false)
  const [kiteError, setKiteError] = useState<string | null>(null)
  const [kiteSetupRequired, setKiteSetupRequired] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tickerInput, setTickerInput] = useState("")
  const [activeTab, setActiveTab] = useState("manual")

  // Function to fetch stock price from our API
  const fetchStockPrice = async (ticker: string): Promise<{ price: number; error?: string; data?: any }> => {
    try {
      const response = await fetch(`/api/stock/${ticker}`)
      const data = await response.json()
      
      if (!response.ok) {
        return { price: 0, error: data.error || "Failed to fetch stock price" }
      }
      
      return { 
        price: data.price || 0, 
        error: data.error,
        data: data
      }
    } catch (error) {
      return { price: 0, error: "Network error" }
    }
  }

  const handleAddStock = async () => {
    if (!tickerInput.trim()) return

    const ticker = tickerInput.trim().toUpperCase()
    
    // Check if stock already exists
    if (stocks.some(stock => stock.ticker === ticker)) {
      alert("Stock already exists in the list!")
      return
    }

    // Add stock with loading state
    const newStock: Stock = {
      ticker,
      price: 0,
      loading: true
    }
    setStocks(prev => [...prev, newStock])
    setTickerInput("")
    setIsModalOpen(false)

    // Fetch the stock price
    const result = await fetchStockPrice(ticker)
    
    if (result.error) {
      // Update with error state
      setStocks(prev => prev.map(stock => 
        stock.ticker === ticker 
          ? { 
              ...stock, 
              ticker: result.data?.ticker || ticker,
              symbol: result.data?.symbol,
              exchange: result.data?.exchange,
              price: 0, // Set price to 0 for unavailable data
              loading: false, 
              error: result.error,
              lastUpdated: new Date() 
            }
          : stock
      ))
    } else {
      // Update with successful price and additional data
      setStocks(prev => prev.map(stock => 
        stock.ticker === ticker 
          ? { 
              ...stock, 
              ticker: result.data?.ticker || ticker,
              symbol: result.data?.symbol,
              exchange: result.data?.exchange,
              price: result.price, 
              loading: false, 
              error: undefined,
              lastUpdated: new Date() 
            }
          : stock
      ))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddStock()
    }
  }

  const refreshAllPrices = async () => {
    if (stocks.length === 0) return
    
    // Set all stocks to loading state
    setStocks(prev => prev.map(stock => ({ ...stock, loading: true, error: undefined })))
    
    // Fetch prices for all stocks
    for (const stock of stocks) {
      const result = await fetchStockPrice(stock.ticker)
      
      if (result.error) {
        setStocks(prev => prev.map(s => 
          s.ticker === stock.ticker 
            ? { ...s, loading: false, error: result.error }
            : s
        ))
      } else {
        setStocks(prev => prev.map(s => 
          s.ticker === stock.ticker 
            ? { 
                ...s, 
                ticker: result.data?.ticker || s.ticker,
                symbol: result.data?.symbol || s.symbol,
                exchange: result.data?.exchange || s.exchange,
                price: result.price, 
                loading: false, 
                lastUpdated: new Date(), 
                error: undefined 
              }
            : s
        ))
      }
    }
  }

  // Function to fetch Kite holdings
  const fetchKiteHoldings = async () => {
    setKiteLoading(true)
    setKiteError(null)
    setKiteSetupRequired(false)

    try {
      const response = await fetch('/api/kite/holdings')
      const data: KiteHoldingsResponse = await response.json()

      if (!response.ok) {
        if (data.setup_required) {
          setKiteSetupRequired(true)
          setKiteError("Kite API not configured. Please set up your Zerodha API credentials.")
        } else if (data.token_expired) {
          setKiteError("Your Kite access token has expired. Please regenerate it.")
        } else {
          setKiteError(data.error || "Failed to fetch Kite holdings")
        }
        return
      }

      if (data.success) {
        // Calculate weights for each holding
        const totalPortfolioValue = data.totalValue;
        const holdingsWithWeights = data.holdings.map(holding => ({
          ...holding,
          weight: totalPortfolioValue > 0 ? (holding.value / totalPortfolioValue) * 100 : 0
        }));
        
        setKiteHoldings(holdingsWithWeights)
      } else {
        setKiteError(data.error || "Failed to fetch holdings")
      }
    } catch (error) {
      setKiteError("Network error. Please check your connection.")
      console.error("Error fetching Kite holdings:", error)
    } finally {
      setKiteLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Stock Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Manual Stocks
            </TabsTrigger>
            <TabsTrigger value="kite" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Zerodha Portfolio
            </TabsTrigger>
          </TabsList>

          {/* Manual Stocks Tab */}
          <TabsContent value="manual">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Manually Added Stocks</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={refreshAllPrices}
                    disabled={stocks.length === 0}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Stock
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Stock</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="ticker">Stock Ticker</Label>
                          <Input
                            id="ticker"
                            placeholder="e.g., AAPL, NASDAQ:GOOGL, NSE:RELIANCE"
                            value={tickerInput}
                            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                            onKeyPress={handleKeyPress}
                            autoFocus
                            maxLength={20}
                          />
                          <p className="text-sm text-muted-foreground">
                            Enter a stock ticker symbol. Examples: AAPL, NASDAQ:GOOGL, NSE:RELIANCE, BSE:TCS, NYSE:TSLA. Note: Real-time data from live sources - unavailable data shows '-'.
                          </p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddStock}>
                            Add Stock
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {stocks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No stocks added yet. Click "Add Stock" to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticker</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stocks.map((stock) => (
                        <TableRow key={stock.ticker}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{stock.ticker}</div>
                              {stock.symbol && stock.exchange && stock.ticker !== `${stock.exchange}:${stock.symbol}` && (
                                <div className="text-sm text-muted-foreground">
                                  {stock.exchange}:{stock.symbol}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {stock.loading ? (
                              <Skeleton className="h-6 w-20" />
                            ) : stock.error || stock.price === 0 ? (
                              <div>
                                <span className="text-muted-foreground">-</span>
                                {stock.error && (
                                  <div className="text-xs text-red-500 mt-1">{stock.error}</div>
                                )}
                              </div>
                            ) : (
                              <span className="font-semibold">
                                {getCurrencySymbol(stock.exchange)}{stock.price.toFixed(2)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {stock.loading ? (
                              <Skeleton className="h-4 w-24" />
                            ) : stock.lastUpdated ? (
                              stock.lastUpdated.toLocaleTimeString()
                            ) : (
                              'Never'
                            )}
                          </TableCell>
                          <TableCell>
                            {stock.loading ? (
                              <Skeleton className="h-4 w-16" />
                            ) : stock.error ? (
                              <span className="text-red-500 text-sm">Error</span>
                            ) : (
                              <span className="text-green-500 text-sm">✓ Active</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Kite Holdings Tab */}
          <TabsContent value="kite">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Zerodha Kite Portfolio</h3>
                <Button 
                  onClick={fetchKiteHoldings}
                  disabled={kiteLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${kiteLoading ? 'animate-spin' : ''}`} />
                  {kiteLoading ? 'Loading...' : 'Fetch Holdings'}
                </Button>
              </div>

              {kiteSetupRequired && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">Setup Required</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    To connect your Zerodha account, you need to set up API credentials:
                  </p>
                  <ol className="text-sm text-yellow-700 mt-2 ml-4 list-decimal">
                    <li>Visit <a href="https://kite.zerodha.com/apps" target="_blank" rel="noopener noreferrer" className="underline">Kite Apps</a></li>
                    <li>Create a new app to get API Key and Secret</li>
                    <li>Set environment variables: KITE_API_KEY, KITE_API_SECRET, KITE_ACCESS_TOKEN</li>
                    <li>Generate access token through Kite login flow</li>
                  </ol>
                </div>
              )}

              {kiteError && !kiteSetupRequired && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-800">Error</h4>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{kiteError}</p>
                </div>
              )}

              {kiteHoldings.length === 0 && !kiteLoading && !kiteError ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Fetch Holdings" to load your Zerodha portfolio.</p>
                </div>
              ) : kiteHoldings.length > 0 ? (
                <>
                  {/* Portfolio Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium text-blue-800">Total Value</h4>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        ₹{kiteHoldings.reduce((sum, h) => sum + h.value, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium text-green-800">Total P&L</h4>
                      </div>
                      <p className={`text-2xl font-bold mt-1 ${
                        kiteHoldings.reduce((sum, h) => sum + h.pnl, 0) >= 0 
                          ? 'text-green-900' 
                          : 'text-red-900'
                      }`}>
                        ₹{kiteHoldings.reduce((sum, h) => sum + h.pnl, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-purple-600" />
                        <h4 className="font-medium text-purple-800">Holdings</h4>
                      </div>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {kiteHoldings.length}
                      </p>
                    </div>
                  </div>

                  {/* Holdings Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stock</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Avg Price</TableHead>
                          <TableHead>Current Price</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>P&L</TableHead>
                          <TableHead>P&L %</TableHead>
                          <TableHead>Weight</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kiteHoldings.map((holding) => (
                          <TableRow key={holding.instrument}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold">{holding.symbol}</div>
                                <div className="text-sm text-muted-foreground">{holding.exchange}</div>
                              </div>
                            </TableCell>
                            <TableCell>{holding.quantity}</TableCell>
                            <TableCell>₹{holding.averagePrice.toFixed(2)}</TableCell>
                            <TableCell>₹{holding.price.toFixed(2)}</TableCell>
                            <TableCell className="font-semibold">₹{holding.value.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className={`font-semibold ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₹{holding.pnl.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  holding.pnlPercent >= 0 
                                    ? 'bg-green-600 text-white border-transparent hover:bg-green-700' 
                                    : 'bg-red-600 text-white border-transparent hover:bg-red-700'
                                }
                              >
                                {holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-blue-600">
                                {holding.weight.toFixed(2)}%
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
