import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Alerts = ({ currentSymbol }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewAlertForm, setShowNewAlertForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    stock_symbol: '',
    alert_type: 'price_above',
    target_value: ''
  });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/alerts?user_id=1');
      const data = await response.json();
      
      if (response.ok) {
        setAlerts(data);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    if (!newAlert.stock_symbol || !newAlert.target_value) return;

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAlert,
          user_id: 1,
          stock_symbol: newAlert.stock_symbol.toUpperCase(),
          target_value: parseFloat(newAlert.target_value)
        }),
      });

      if (response.ok) {
        setNewAlert({
          stock_symbol: '',
          alert_type: 'price_above',
          target_value: ''
        });
        setShowNewAlertForm(false);
        fetchAlerts();
      }
    } catch (err) {
      console.error('Error creating alert:', err);
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  const updateAlertStatus = async (alertId, status) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error('Error updating alert:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (currentSymbol && showNewAlertForm) {
      setNewAlert(prev => ({
        ...prev,
        stock_symbol: currentSymbol.toUpperCase()
      }));
    }
  }, [currentSymbol, showNewAlertForm]);

  const getAlertIcon = (status) => {
    switch (status) {
      case 'triggered':
        return <AlertTriangle className="text-red-500" size={16} />;
      case 'active':
        return <Bell className="text-blue-500" size={16} />;
      default:
        return <Bell className="text-gray-400" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'triggered':
        return 'text-red-600 bg-red-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'disabled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Price Alerts</h3>
        <Button
          size="sm"
          onClick={() => setShowNewAlertForm(!showNewAlertForm)}
        >
          <Plus size={16} className="mr-1" />
          New Alert
        </Button>
      </div>

      {showNewAlertForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Symbol
              </label>
              <input
                type="text"
                value={newAlert.stock_symbol}
                onChange={(e) => setNewAlert(prev => ({
                  ...prev,
                  stock_symbol: e.target.value.toUpperCase()
                }))}
                placeholder="e.g., AAPL"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Type
              </label>
              <select
                value={newAlert.alert_type}
                onChange={(e) => setNewAlert(prev => ({
                  ...prev,
                  alert_type: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="price_above">Price Above</option>
                <option value="price_below">Price Below</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={newAlert.target_value}
                onChange={(e) => setNewAlert(prev => ({
                  ...prev,
                  target_value: e.target.value
                }))}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={createAlert}>
                Create Alert
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowNewAlertForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500 py-4">
          Loading alerts...
        </div>
      )}

      {!loading && alerts.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No alerts found. Create one to get notified of price changes.
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className="p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.status)}
                  <div>
                    <div className="font-medium text-gray-800">
                      {alert.stock_symbol}
                    </div>
                    <div className="text-sm text-gray-600">
                      {alert.alert_type === 'price_above' ? 'Above' : 'Below'} ${alert.target_value}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                  
                  {alert.status === 'triggered' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAlertStatus(alert.id, 'active')}
                    >
                      Reset
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteAlert(alert.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {alert.triggered_at && (
                <div className="mt-2 text-xs text-gray-500">
                  Triggered: {new Date(alert.triggered_at).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;

