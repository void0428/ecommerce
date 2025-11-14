import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const { user } = useAuth();
  const { updateCartCount } = useCart();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [formData, setFormData] = useState({
    shipping_address: '',
    phone_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      console.log('Checkout cart response:', response.data); // Debug log
      // Handle both array and object responses
      let cartData = response.data;
      if (Array.isArray(cartData) && cartData.length > 0) {
        cartData = cartData[0];
      }
      // Ensure cart has items array
      if (!cartData || !cartData.items) {
        cartData = cartData || {};
        cartData.items = [];
      }
      if (!Array.isArray(cartData.items)) {
        cartData.items = [];
      }
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [], total_items: 0, total_amount: 0 });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await cartAPI.checkout(formData);
      updateCartCount(); // Update cart count after checkout (should be 0)
      navigate(`/orders`);
    } catch (error) {
      console.error('Checkout error:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.error || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="error">Your cart is empty</div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>
        <div className="checkout-layout">
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit} className="checkout-form">
              <h2>Shipping Information</h2>
              <div className="form-group">
                <label>Shipping Address *</label>
                <textarea
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Enter your complete shipping address"
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>
              {error && <div className="error">{error}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cart.items.map((item) => (
                <div key={item.id} className="summary-item">
                  <div>
                    <strong>{item.product?.name || 'Product'}</strong>
                    <p>Size: {item.size} × {item.quantity}</p>
                  </div>
                  <span>${Number(item.subtotal || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <div className="summary-row">
                <span>Items:</span>
                <span>{cart.total_items || 0}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${Number(cart.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

