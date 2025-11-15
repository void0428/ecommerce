import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';

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
      console.log('Orders API Response:', response.data);
      const ordersData = response.data?.results || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', error.response?.data);
      setOrders([]);
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
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-gray-600 font-sans-body">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif-heading text-4xl md:text-5xl text-[#2b3349] mb-12 text-center tracking-wider">
          My Orders
        </h1>
        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 font-sans-body">You have no orders yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                  <div>
                    <h3 className="font-serif-heading text-2xl text-[#2b3349] mb-2 tracking-wider">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600 font-sans-body">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span
                      className="inline-block px-4 py-2 text-xs font-semibold text-white uppercase tracking-wider"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  {Array.isArray(order.items) && order.items.map((item) => {
                    const imageUrl = getImageUrl(item.product?.image);
                    
                    return (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="w-20 h-24 bg-gray-50 overflow-hidden flex-shrink-0">
                          <img 
                            src={imageUrl} 
                            alt={item.product?.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm text-[#2b3349] font-sans-body uppercase tracking-wider mb-1">
                            {item.product?.name || 'Product'}
                          </h4>
                          <p className="text-xs text-gray-600 font-sans-body">
                            Size: {item.size} × {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm text-[#2b3349] font-sans-body">
                          ${Number(item.subtotal || 0).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pt-6 border-t border-gray-200">
                  <div className="text-lg font-sans-body">
                    <strong className="text-[#2b3349]">
                      Total: ${Number(order.total_amount || 0).toFixed(2)}
                    </strong>
                  </div>
                  {order.status === 'P' && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="border border-red-600 text-red-600 px-6 py-2 text-sm uppercase tracking-wider font-sans-body hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                  <p className="text-sm text-gray-600 font-sans-body">
                    <strong>Shipping Address:</strong> {order.shipping_address || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 font-sans-body">
                    <strong>Phone:</strong> {order.phone_number || 'N/A'}
                  </p>
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
