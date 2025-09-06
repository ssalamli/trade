import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StockSearch = ({ onSymbolSelect, currentSymbol }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchStocks = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 1) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stocks/search/${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (response.ok) {
        setResults(data.matches || []);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStocks(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectStock = (symbol) => {
    setQuery(symbol);
    setShowResults(false);
    onSymbolSelect(symbol);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSymbolSelect(query.trim().toUpperCase());
      setShowResults(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks (e.g., AAPL, MSFT)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" disabled={!query.trim()}>
          Search
        </Button>
      </form>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {loading && (
            <div className="p-3 text-center text-gray-500">
              Searching...
            </div>
          )}
          
          {!loading && results.length === 0 && query && (
            <div className="p-3 text-center text-gray-500">
              No results found for "{query}"
            </div>
          )}
          
          {!loading && results.length > 0 && (
            <div>
              {results.slice(0, 10).map((stock, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectStock(stock.symbol)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {stock.symbol}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {stock.name}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {stock.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSearch;

