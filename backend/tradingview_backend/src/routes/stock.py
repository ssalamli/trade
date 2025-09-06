from flask import Blueprint, jsonify, request
import requests
import os
from datetime import datetime, timedelta

stock_bp = Blueprint('stock', __name__)
# Finnhub API configuration
FINNHUB_API_KEY = os.environ.get("FINNHUB_API_KEY")
FINNHUB_BASE_URL = "https://finnhub.io/api/v1"

@stock_bp.route('/stocks/quote/<symbol>', methods=['GET'])
def get_stock_quote(symbol):
    """Get real-time stock quote"""
    try:
        params = {
            'symbol': symbol.upper(),
            'token': FINNHUB_API_KEY
        }
        
        response = requests.get(f"{FINNHUB_BASE_URL}/quote", params=params)
        data = response.json()
        
        if data and data.get('c') is not None:
            return jsonify({
                'symbol': symbol.upper(),
                'price': data['c'],
                'change': data['d'],
                'change_percent': data['dp'],
                'high': data['h'],
                'low': data['l'],
                'open': data['o'],
                'previous_close': data['pc'],
                'timestamp': data['t']
            })
        else:
            return jsonify({'error': 'Stock not found or API limit reached'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/stocks/historical/<symbol>', methods=['GET'])
def get_historical_data(symbol):
    """Get historical stock data"""
    try:
        resolution = request.args.get("resolution", "D")  # 1, 5, 15, 30, 60, D, W, M
        
        # Finnhub requires start and end time in UNIX timestamp
        to_timestamp = int(datetime.now().timestamp())
        from_timestamp = int((datetime.now() - timedelta(days=365)).timestamp()) # Last 1 year of data
        
        params = {
            "symbol": symbol.upper(),
            "resolution": resolution,
            "from": from_timestamp,
            "to": to_timestamp,
            "token": FINNHUB_API_KEY
        }
        
        response = requests.get(f"{FINNHUB_BASE_URL}/stock/candle", params=params)

        data = response.json()
        
        if data and data["s"] == "ok":
            historical_data = []
            for i in range(len(data["t"])):
                historical_data.append({
                    "date": datetime.fromtimestamp(data["t"][i]).strftime("%Y-%m-%d"),
                    "open": data["o"][i],
                    "high": data["h"][i],
                    "low": data["l"][i],
                    "close": data["c"][i],
                    "volume": data["v"][i]
                })
            
            historical_data.sort(key=lambda x: x["date"], reverse=True)
            
            return jsonify({
                "symbol": symbol.upper(),
                "resolution": resolution,
                "data": historical_data
            })
        else:
            return jsonify({"error": "Historical data not found or API limit reached"}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/stocks/search/<query>', methods=['GET'])
def search_stocks(query):
    """Search for stocks by symbol or company name"""
    try:
        params = {
            'q': query,
            'token': FINNHUB_API_KEY
        }
        
        response = requests.get(f"{FINNHUB_BASE_URL}/search", params=params)
        data = response.json()
        
        if data and data['result']:
            matches = []
            for match in data['result']:
                matches.append({
                    'symbol': match.get('symbol', ''),
                    'name': match.get('description', ''),
                    'type': match.get('type', '')
                })
            
            return jsonify({
                'query': query,
                'matches': matches
            })
        else:
            return jsonify({'error': 'No matches found or API limit reached'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route("/stocks/intraday/<symbol>", methods=["GET"])
def get_intraday_data(symbol):
    """Get intraday stock data"""
    try:
        resolution = request.args.get("resolution", "1")  # 1, 5, 15, 30, 60
        
        to_timestamp = int(datetime.now().timestamp())
        from_timestamp = int((datetime.now() - timedelta(days=1)).timestamp()) # Last 1 day of data
        
        params = {
            "symbol": symbol.upper(),
            "resolution": resolution,
            "from": from_timestamp,
            "to": to_timestamp,
            "token": FINNHUB_API_KEY
        }
        
        response = requests.get(f"{FINNHUB_BASE_URL}/stock/candle", params=params)
        data = response.json()
        
        if data and data["s"] == "ok":
            intraday_data = []
            for i in range(len(data["t"])):
                intraday_data.append({
                    "timestamp": datetime.fromtimestamp(data["t"][i]).strftime("%Y-%m-%d %H:%M:%S"),
                    "open": data["o"][i],
                    "high": data["h"][i],
                    "low": data["l"][i],
                    "close": data["c"][i],
                    "volume": data["v"][i]
                })
            
            intraday_data.sort(key=lambda x: x["timestamp"], reverse=True)
            
            return jsonify({
                "symbol": symbol.upper(),
                "resolution": resolution,
                "data": intraday_data
            })
        else:
            return jsonify({"error": "Intraday data not found or API limit reached"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

