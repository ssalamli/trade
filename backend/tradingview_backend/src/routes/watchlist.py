from flask import Blueprint, jsonify, request
from src.models.stock import Watchlist, WatchlistItem, db

watchlist_bp = Blueprint('watchlist', __name__)

@watchlist_bp.route('/watchlists', methods=['GET'])
def get_watchlists():
    """Get all watchlists for a user"""
    user_id = request.args.get('user_id', 1)  # Default to user 1 for now
    watchlists = Watchlist.query.filter_by(user_id=user_id).all()
    return jsonify([watchlist.to_dict() for watchlist in watchlists])

@watchlist_bp.route('/watchlists', methods=['POST'])
def create_watchlist():
    """Create a new watchlist"""
    data = request.json
    user_id = data.get('user_id', 1)  # Default to user 1 for now
    name = data.get('name', 'My Watchlist')
    
    watchlist = Watchlist(user_id=user_id, name=name)
    db.session.add(watchlist)
    db.session.commit()
    
    return jsonify(watchlist.to_dict()), 201

@watchlist_bp.route('/watchlists/<int:watchlist_id>', methods=['GET'])
def get_watchlist(watchlist_id):
    """Get a specific watchlist"""
    watchlist = Watchlist.query.get_or_404(watchlist_id)
    return jsonify(watchlist.to_dict())

@watchlist_bp.route('/watchlists/<int:watchlist_id>', methods=['PUT'])
def update_watchlist(watchlist_id):
    """Update a watchlist name"""
    watchlist = Watchlist.query.get_or_404(watchlist_id)
    data = request.json
    
    watchlist.name = data.get('name', watchlist.name)
    db.session.commit()
    
    return jsonify(watchlist.to_dict())

@watchlist_bp.route('/watchlists/<int:watchlist_id>', methods=['DELETE'])
def delete_watchlist(watchlist_id):
    """Delete a watchlist"""
    watchlist = Watchlist.query.get_or_404(watchlist_id)
    db.session.delete(watchlist)
    db.session.commit()
    
    return '', 204

@watchlist_bp.route('/watchlists/<int:watchlist_id>/items', methods=['POST'])
def add_stock_to_watchlist(watchlist_id):
    """Add a stock to a watchlist"""
    watchlist = Watchlist.query.get_or_404(watchlist_id)
    data = request.json
    stock_symbol = data.get('stock_symbol', '').upper()
    
    if not stock_symbol:
        return jsonify({'error': 'Stock symbol is required'}), 400
    
    # Check if stock is already in watchlist
    existing_item = WatchlistItem.query.filter_by(
        watchlist_id=watchlist_id, 
        stock_symbol=stock_symbol
    ).first()
    
    if existing_item:
        return jsonify({'error': 'Stock already in watchlist'}), 400
    
    item = WatchlistItem(watchlist_id=watchlist_id, stock_symbol=stock_symbol)
    db.session.add(item)
    db.session.commit()
    
    return jsonify(item.to_dict()), 201

@watchlist_bp.route('/watchlists/<int:watchlist_id>/items/<int:item_id>', methods=['DELETE'])
def remove_stock_from_watchlist(watchlist_id, item_id):
    """Remove a stock from a watchlist"""
    item = WatchlistItem.query.filter_by(
        id=item_id, 
        watchlist_id=watchlist_id
    ).first_or_404()
    
    db.session.delete(item)
    db.session.commit()
    
    return '', 204

@watchlist_bp.route('/watchlists/<int:watchlist_id>/items', methods=['GET'])
def get_watchlist_items(watchlist_id):
    """Get all items in a watchlist"""
    watchlist = Watchlist.query.get_or_404(watchlist_id)
    items = WatchlistItem.query.filter_by(watchlist_id=watchlist_id).all()
    return jsonify([item.to_dict() for item in items])

