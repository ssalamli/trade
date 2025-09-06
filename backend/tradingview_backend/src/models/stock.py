from flask_sqlalchemy import SQLAlchemy
from src.models.user import db

class Watchlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationship to watchlist items
    items = db.relationship('WatchlistItem', backref='watchlist', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'items': [item.to_dict() for item in self.items]
        }

class WatchlistItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    watchlist_id = db.Column(db.Integer, db.ForeignKey('watchlist.id'), nullable=False)
    stock_symbol = db.Column(db.String(10), nullable=False)
    added_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    def to_dict(self):
        return {
            'id': self.id,
            'watchlist_id': self.watchlist_id,
            'stock_symbol': self.stock_symbol,
            'added_at': self.added_at.isoformat() if self.added_at else None
        }

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    stock_symbol = db.Column(db.String(10), nullable=False)
    alert_type = db.Column(db.String(20), nullable=False)  # 'price_above', 'price_below'
    target_value = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='active')  # 'active', 'triggered', 'disabled'
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    triggered_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stock_symbol': self.stock_symbol,
            'alert_type': self.alert_type,
            'target_value': self.target_value,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'triggered_at': self.triggered_at.isoformat() if self.triggered_at else None
        }

