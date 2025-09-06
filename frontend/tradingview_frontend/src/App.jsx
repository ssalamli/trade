import { useState } from 'react'
import StockChart from './components/StockChart'
import StockQuote from './components/StockQuote'
import StockSearch from './components/StockSearch'
import Watchlist from './components/Watchlist'
import Alerts from './components/Alerts'
import './App.css'

function App() {
  const [currentSymbol, setCurrentSymbol] = useState('AAPL')

  const handleSymbolSelect = (symbol) => {
    setCurrentSymbol(symbol.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">TradingView Clone</h1>
            </div>
            <div className="flex items-center">
              <StockSearch 
                onSymbolSelect={handleSymbolSelect}
                currentSymbol={currentSymbol}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Watchlist 
              onSymbolSelect={handleSymbolSelect}
              currentSymbol={currentSymbol}
            />
            <Alerts currentSymbol={currentSymbol} />
          </div>

          {/* Main Chart Area */}
          <div className="lg:col-span-3 space-y-6">
            <StockQuote symbol={currentSymbol} />
            <div className="h-96">
              <StockChart 
                symbol={currentSymbol}
                onSymbolChange={handleSymbolSelect}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            TradingView Clone - Built with React and Flask
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
