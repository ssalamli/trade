import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StockQuote = ({ symbol }) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuote = async (stockSymbol) => {
    if (!stockSymbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/stocks/quote/${stockSymbol}`);
      const data = await response.json();
      
      if (response.ok) {
        setQuote(data);
      } else {
        setError(data.error || 'Failed to fetch quote');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchQuote(symbol);
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => fetchQuote(symbol), 30000);
      return () => clearInterval(interval);
    }
  }, [symbol]);

  const formatPrice = (price) => {
    return price ? `$${price.toFixed(2)}` : 'N/A';
  };

  const formatChange = (change) => {
    if (!change) return 'N/A';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const getChangeColor = (change) => {
    if (!change) return 'text-gray-500';
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (!symbol) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          Enter a stock symbol to view quote
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          Loading quote for {symbol.toUpperCase()}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          No quote data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{quote.symbol}</h2>
        <div className="text-sm text-gray-500">
          Last updated: {quote.latest_trading_day}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Current Price</div>
          <div className="text-2xl font-bold text-gray-800">
            {formatPrice(quote.price)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Change</div>
          <div className={`text-xl font-semibold flex items-center justify-center gap-1 ${getChangeColor(quote.change)}`}>
            {quote.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {formatChange(quote.change)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Change %</div>
          <div className={`text-xl font-semibold ${getChangeColor(quote.change)}`}>
            {quote.change_percent}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Volume</div>
          <div className="text-lg font-medium text-gray-800">
            {quote.volume ? quote.volume.toLocaleString() : 'N/A'}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Open</div>
          <div className="text-lg font-medium text-gray-800">
            {formatPrice(quote.open)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">High</div>
          <div className="text-lg font-medium text-gray-800">
            {formatPrice(quote.high)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Low</div>
          <div className="text-lg font-medium text-gray-800">
            {formatPrice(quote.low)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Previous Close</div>
          <div className="text-lg font-medium text-gray-800">
            {formatPrice(quote.previous_close)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockQuote;

