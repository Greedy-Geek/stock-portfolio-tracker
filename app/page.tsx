import { StockTableWithKite } from "@/components/stock-table-with-kite"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Stock Portfolio</h1>
        <StockTableWithKite />
      </div>
    </main>
  )
}
