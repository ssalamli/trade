from flask import Blueprint, jsonify, request
from src.models.stock import Alert, db
from datetime import datetime

alert_bp = Blueprint('alert', __name__)

@alert_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Get all alerts for a user"""
    user_id = request.args.get('user_id', 1)  # Default to user 1 for now
    status = request.args.get('status')  # Optional filter by status
    
    query = Alert.query.filter_by(user_id=user_id)
    if status:
        query = query.filter_by(status=status)
    
    alerts = query.all()
    return jsonify([alert.to_dict() for alert in alerts])

@alert_bp.route('/alerts', methods=['POST'])
def create_alert():
    """Create a new price alert"""
    data = request.json
    
    required_fields = ['stock_symbol', 'alert_type', 'target_value']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    user_id = data.get('user_id', 1)  # Default to user 1 for now
    stock_symbol = data['stock_symbol'].upper()
    alert_type = data['alert_type']
    target_value = float(data['target_value'])
    
    # Validate alert_type
    if alert_type not in ['price_above', 'price_below']:
        return jsonify({'error': 'alert_type must be price_above or price_below'}), 400
    
    alert = Alert(
        user_id=user_id,
        stock_symbol=stock_symbol,
        alert_type=alert_type,
        target_value=target_value
    )
    
    db.session.add(alert)
    db.session.commit()
    
    return jsonify(alert.to_dict()), 201

@alert_bp.route('/alerts/<int:alert_id>', methods=['GET'])
def get_alert(alert_id):
    """Get a specific alert"""
    alert = Alert.query.get_or_404(alert_id)
    return jsonify(alert.to_dict())

@alert_bp.route('/alerts/<int:alert_id>', methods=['PUT'])
def update_alert(alert_id):
    """Update an alert"""
    alert = Alert.query.get_or_404(alert_id)
    data = request.json
    
    # Update allowed fields
    if 'alert_type' in data:
        if data['alert_type'] not in ['price_above', 'price_below']:
            return jsonify({'error': 'alert_type must be price_above or price_below'}), 400
        alert.alert_type = data['alert_type']
    
    if 'target_value' in data:
        alert.target_value = float(data['target_value'])
    
    if 'status' in data:
        if data['status'] not in ['active', 'triggered', 'disabled']:
            return jsonify({'error': 'status must be active, triggered, or disabled'}), 400
        alert.status = data['status']
        
        # Set triggered_at if status is being set to triggered
        if data['status'] == 'triggered' and alert.status != 'triggered':
            alert.triggered_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(alert.to_dict())

@alert_bp.route('/alerts/<int:alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    """Delete an alert"""
    alert = Alert.query.get_or_404(alert_id)
    db.session.delete(alert)
    db.session.commit()
    
    return '', 204

@alert_bp.route('/alerts/check', methods=['POST'])
def check_alerts():
    """Check alerts against current stock prices"""
    data = request.json
    stock_prices = data.get('stock_prices', {})  # Dict of symbol: price
    
    triggered_alerts = []
    
    # Get all active alerts
    active_alerts = Alert.query.filter_by(status='active').all()
    
    for alert in active_alerts:
        symbol = alert.stock_symbol
        if symbol in stock_prices:
            current_price = float(stock_prices[symbol])
            
            should_trigger = False
            if alert.alert_type == 'price_above' and current_price >= alert.target_value:
                should_trigger = True
            elif alert.alert_type == 'price_below' and current_price <= alert.target_value:
                should_trigger = True
            
            if should_trigger:
                alert.status = 'triggered'
                alert.triggered_at = datetime.utcnow()
                triggered_alerts.append(alert.to_dict())
    
    db.session.commit()
    
    return jsonify({
        'triggered_alerts': triggered_alerts,
        'count': len(triggered_alerts)
    })

