import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stock Portfolio Tracker',
  description: 'Track your stock portfolio with real-time data and Zerodha Kite integration. Monitor holdings, P&L, and performance across multiple exchanges.',
  keywords: ['stock tracker', 'portfolio management', 'zerodha', 'kite', 'real-time stocks', 'NSE', 'BSE', 'NASDAQ'],
  authors: [{ name: 'Stock Portfolio Tracker' }],
  openGraph: {
    title: 'Stock Portfolio Tracker',
    description: 'Track your stock portfolio with real-time data and Zerodha Kite integration',
    type: 'website',
    url: 'https://github.com/Greedy-Geek/stock-portfolio-tracker',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock Portfolio Tracker',
    description: 'Track your stock portfolio with real-time data and Zerodha Kite integration',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
