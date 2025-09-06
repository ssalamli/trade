import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Watchlist = ({ onSymbolSelect, currentSymbol }) => {
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [showNewWatchlistForm, setShowNewWatchlistForm] = useState(false);

  const fetchWatchlists = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/watchlists?user_id=1');
      const data = await response.json();
      
      if (response.ok) {
        setWatchlists(data);
        if (data.length > 0 && !selectedWatchlist) {
          setSelectedWatchlist(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching watchlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const createWatchlist = async () => {
    if (!newWatchlistName.trim()) return;

    try {
      const response = await fetch('/api/watchlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newWatchlistName,
          user_id: 1
        }),
      });

      if (response.ok) {
        setNewWatchlistName('');
        setShowNewWatchlistForm(false);
        fetchWatchlists();
      }
    } catch (err) {
      console.error('Error creating watchlist:', err);
    }
  };

  const addToWatchlist = async (symbol) => {
    if (!selectedWatchlist || !symbol) return;

    try {
      const response = await fetch(`/api/watchlists/${selectedWatchlist.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock_symbol: symbol.toUpperCase()
        }),
      });

      if (response.ok) {
        fetchWatchlists();
      }
    } catch (err) {
      console.error('Error adding to watchlist:', err);
    }
  };

  const removeFromWatchlist = async (itemId) => {
    if (!selectedWatchlist) return;

    try {
      const response = await fetch(`/api/watchlists/${selectedWatchlist.id}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchWatchlists();
      }
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, []);

  useEffect(() => {
    if (watchlists.length > 0) {
      const updated = watchlists.find(w => w.id === selectedWatchlist?.id);
      if (updated) {
        setSelectedWatchlist(updated);
      }
    }
  }, [watchlists]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Watchlists</h3>
        <Button
          size="sm"
          onClick={() => setShowNewWatchlistForm(!showNewWatchlistForm)}
        >
          <Plus size={16} className="mr-1" />
          New
        </Button>
      </div>

      {showNewWatchlistForm && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              placeholder="Watchlist name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button size="sm" onClick={createWatchlist}>
              Create
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500 py-4">
          Loading watchlists...
        </div>
      )}

      {!loading && watchlists.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No watchlists found. Create one to get started.
        </div>
      )}

      {!loading && watchlists.length > 0 && (
        <div>
          {/* Watchlist selector */}
          {watchlists.length > 1 && (
            <div className="mb-4">
              <select
                value={selectedWatchlist?.id || ''}
                onChange={(e) => {
                  const watchlist = watchlists.find(w => w.id === parseInt(e.target.value));
                  setSelectedWatchlist(watchlist);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {watchlists.map(watchlist => (
                  <option key={watchlist.id} value={watchlist.id}>
                    {watchlist.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Add current symbol button */}
          {currentSymbol && selectedWatchlist && (
            <div className="mb-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addToWatchlist(currentSymbol)}
                className="w-full"
              >
                <Star size={16} className="mr-1" />
                Add {currentSymbol.toUpperCase()} to Watchlist
              </Button>
            </div>
          )}

          {/* Watchlist items */}
          {selectedWatchlist && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                {selectedWatchlist.name}
              </h4>
              
              {selectedWatchlist.items.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No stocks in this watchlist
                </div>
              )}

              {selectedWatchlist.items.length > 0 && (
                <div className="space-y-2">
                  {selectedWatchlist.items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                      onClick={() => onSymbolSelect(item.stock_symbol)}
                    >
                      <div className="font-medium text-gray-800">
                        {item.stock_symbol}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(item.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Watchlist;

