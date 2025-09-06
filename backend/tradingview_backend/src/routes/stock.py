from flask import Blueprint, jsonify, request
import requests
import os
from datetime import datetime, timedelta

stock_bp = Blueprint('stock', __name__)

# Alpha Vantage API configuration
ALPHA_VANTAGE_API_KEY = os.environ.get('ALPHA_VANTAGE_API_KEY', 'demo')
ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query'

@stock_bp.route('/stocks/quote/<symbol>', methods=['GET'])
def get_stock_quote(symbol):
    """Get real-time stock quote"""
    try:
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol.upper(),
            'apikey': ALPHA_VANTAGE_API_KEY
        }
        
        response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
        data = response.json()
        
        if 'Global Quote' in data:
            quote = data['Global Quote']
            return jsonify({
                'symbol': quote.get('01. symbol', symbol),
                'price': float(quote.get('05. price', 0)),
                'change': float(quote.get('09. change', 0)),
                'change_percent': quote.get('10. change percent', '0%'),
                'volume': int(quote.get('06. volume', 0)),
                'latest_trading_day': quote.get('07. latest trading day', ''),
                'previous_close': float(quote.get('08. previous close', 0)),
                'open': float(quote.get('02. open', 0)),
                'high': float(quote.get('03. high', 0)),
                'low': float(quote.get('04. low', 0))
            })
        else:
            return jsonify({'error': 'Stock not found or API limit reached'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/stocks/historical/<symbol>', methods=['GET'])
def get_historical_data(symbol):
    """Get historical stock data"""
    try:
        # Get query parameters
        interval = request.args.get('interval', 'daily')  # daily, weekly, monthly
        outputsize = request.args.get('outputsize', 'compact')  # compact (100 days) or full
        
        # Map interval to Alpha Vantage function
        function_map = {
            'daily': 'TIME_SERIES_DAILY',
            'weekly': 'TIME_SERIES_WEEKLY',
            'monthly': 'TIME_SERIES_MONTHLY'
        }
        
        params = {
            'function': function_map.get(interval, 'TIME_SERIES_DAILY'),
            'symbol': symbol.upper(),
            'outputsize': outputsize,
            'apikey': ALPHA_VANTAGE_API_KEY
        }
        
        response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
        data = response.json()
        
        # Find the time series key
        time_series_key = None
        for key in data.keys():
            if 'Time Series' in key:
                time_series_key = key
                break
        
        if time_series_key and time_series_key in data:
            time_series = data[time_series_key]
            
            # Convert to a more frontend-friendly format
            historical_data = []
            for date, values in time_series.items():
                historical_data.append({
                    'date': date,
                    'open': float(values.get('1. open', 0)),
                    'high': float(values.get('2. high', 0)),
                    'low': float(values.get('3. low', 0)),
                    'close': float(values.get('4. close', 0)),
                    'volume': int(values.get('5. volume', 0))
                })
            
            # Sort by date (most recent first)
            historical_data.sort(key=lambda x: x['date'], reverse=True)
            
            return jsonify({
                'symbol': symbol.upper(),
                'interval': interval,
                'data': historical_data
            })
        else:
            return jsonify({'error': 'Historical data not found or API limit reached'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/stocks/search/<query>', methods=['GET'])
def search_stocks(query):
    """Search for stocks by symbol or company name"""
    try:
        params = {
            'function': 'SYMBOL_SEARCH',
            'keywords': query,
            'apikey': ALPHA_VANTAGE_API_KEY
        }
        
        response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
        data = response.json()
        
        if 'bestMatches' in data:
            matches = []
            for match in data['bestMatches']:
                matches.append({
                    'symbol': match.get('1. symbol', ''),
                    'name': match.get('2. name', ''),
                    'type': match.get('3. type', ''),
                    'region': match.get('4. region', ''),
                    'market_open': match.get('5. marketOpen', ''),
                    'market_close': match.get('6. marketClose', ''),
                    'timezone': match.get('7. timezone', ''),
                    'currency': match.get('8. currency', ''),
                    'match_score': float(match.get('9. matchScore', 0))
                })
            
            return jsonify({
                'query': query,
                'matches': matches
            })
        else:
            return jsonify({'error': 'No matches found or API limit reached'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/stocks/intraday/<symbol>', methods=['GET'])
def get_intraday_data(symbol):
    """Get intraday stock data"""
    try:
        interval = request.args.get('interval', '5min')  # 1min, 5min, 15min, 30min, 60min
        
        params = {
            'function': 'TIME_SERIES_INTRADAY',
            'symbol': symbol.upper(),
            'interval': interval,
            'apikey': ALPHA_VANTAGE_API_KEY
        }
        
        response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
        data = response.json()
        
        time_series_key = f'Time Series ({interval})'
        
        if time_series_key in data:
            time_series = data[time_series_key]
            
            # Convert to frontend-friendly format
            intraday_data = []
            for timestamp, values in time_series.items():
                intraday_data.append({
                    'timestamp': timestamp,
                    'open': float(values.get('1. open', 0)),
                    'high': float(values.get('2. high', 0)),
                    'low': float(values.get('3. low', 0)),
                    'close': float(values.get('4. close', 0)),
                    'volume': int(values.get('5. volume', 0))
                })
            
            # Sort by timestamp (most recent first)
            intraday_data.sort(key=lambda x: x['timestamp'], reverse=True)
            
            return jsonify({
                'symbol': symbol.upper(),
                'interval': interval,
                'data': intraday_data
            })
        else:
            return jsonify({'error': 'Intraday data not found or API limit reached'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

