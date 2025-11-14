import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';
import './Cart.css';

const Cart = () => {
  const { user } = useAuth();
  const { updateCartCount } = useCart();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.log('Cart API Response:', response.data); // Debug log
      // Handle both array and object responses
      let cartData = response.data;
      
      // If response is an array (from list view), take first item
      if (Array.isArray(cartData) && cartData.length > 0) {
        cartData = cartData[0];
      } else if (Array.isArray(cartData) && cartData.length === 0) {
        // Empty array means no cart
        cartData = { items: [], total_items: 0, total_amount: 0 };
      }
      
      // Ensure cart has items array even if empty
      if (!cartData || !cartData.items) {
        cartData = cartData || {};
        cartData.items = [];
      }
      
      // Ensure items is an array
      if (!Array.isArray(cartData.items)) {
        cartData.items = [];
      }
      
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
      console.error('Error details:', error.response?.data); // Debug log
      // Set empty cart structure on error
      setCart({ items: [], total_items: 0, total_amount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await cartAPI.updateItem({ item_id: itemId, quantity: newQuantity });
      fetchCart();
      updateCartCount(); // Update cart count in navbar
    } catch (error) {
      console.error('Error updating cart:', error);
      alert(error.response?.data?.error || 'Error updating cart item');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartAPI.removeItem({ item_id: itemId });
      fetchCart();
      updateCartCount(); // Update cart count in navbar
    } catch (error) {
      console.error('Error removing item:', error);
      alert(error.response?.data?.error || 'Error removing cart item');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Check if cart exists and has items array
  if (!cart || !cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="page-title">Shopping Cart</h1>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart</h1>
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => {
              const imageUrl = getImageUrl(item.product?.image);
              
              return (
                <div key={item.id} className="cart-item">
                  <img src={imageUrl} alt={item.product?.name || 'Product'} />
                  <div className="cart-item-info">
                    <h3>{item.product?.name || 'Product'}</h3>
                    <p>Size: {item.size}</p>
                    <p className="price">${Number(item.subtotal || 0).toFixed(2)}</p>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="btn-remove" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Items:</span>
              <span>{cart.total_items || 0}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${Number(cart.total_amount || 0).toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary checkout-btn">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

