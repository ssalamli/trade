import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

const StockChart = ({ symbol, onSymbolChange }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('daily');

  const fetchHistoricalData = async (stockSymbol, interval = 'daily') => {
    if (!stockSymbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/stocks/historical/${stockSymbol}?interval=${interval}`);
      const data = await response.json();
      
      if (response.ok) {
        // Transform data for Recharts
        const transformedData = data.data.slice(0, 100).reverse().map(item => ({
          date: item.date,
          price: item.close,
          open: item.open,
          high: item.high,
          low: item.low,
          volume: item.volume
        }));
        setChartData(transformedData);
      } else {
        setError(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchHistoricalData(symbol, timeframe);
    }
  }, [symbol, timeframe]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatPrice = (value) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {symbol ? `${symbol.toUpperCase()} Stock Chart` : 'Stock Chart'}
        </h2>
        <div className="flex gap-2">
          <Button
            variant={timeframe === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('daily')}
          >
            Daily
          </Button>
          <Button
            variant={timeframe === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={timeframe === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading chart data...</div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatPrice}
                tick={{ fontSize: 12 }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                formatter={(value, name) => [formatPrice(value), name]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={false}
                name="Close Price"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && chartData.length === 0 && symbol && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No chart data available for {symbol}</div>
        </div>
      )}

      {!symbol && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Enter a stock symbol to view chart</div>
        </div>
      )}
    </div>
  );
};

export default StockChart;

