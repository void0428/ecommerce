import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import './Orders.css';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await ordersAPI.cancel(orderId);
        fetchOrders();
      } catch (error) {
        console.error('Error cancelling order:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      P: '#ffc107',
      PR: '#17a2b8',
      S: '#007bff',
      D: '#28a745',
      C: '#dc3545',
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status) => {
    const texts = {
      P: 'Pending',
      PR: 'Processing',
      S: 'Shipped',
      D: 'Delivered',
      C: 'Cancelled',
    };
    return texts[status] || status;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title">My Orders</h1>
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You have no orders yet</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="order-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
                <div className="order-items">
                  {order.items.map((item) => {
                    const imageUrl = getImageUrl(item.product.image);
                    
                    return (
                      <div key={item.id} className="order-item">
                        <img src={imageUrl} alt={item.product.name} />
                        <div className="order-item-info">
                          <h4>{item.product.name}</h4>
                          <p>Size: {item.size} × {item.quantity}</p>
                        </div>
                        <span className="order-item-price">${item.subtotal.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total: ${order.total_amount.toFixed(2)}</strong>
                  </div>
                  {order.status === 'P' && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleCancel(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
                <div className="order-shipping">
                  <p><strong>Shipping Address:</strong> {order.shipping_address}</p>
                  <p><strong>Phone:</strong> {order.phone_number}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

