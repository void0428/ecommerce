import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import './Cart.css';

const Cart = () => {
  const { user } = useAuth();
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
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await cartAPI.updateItem({ item_id: itemId, quantity: newQuantity });
      fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartAPI.removeItem({ item_id: itemId });
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!cart || cart.items.length === 0) {
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
              const imageUrl = getImageUrl(item.product.image);
              
              return (
                <div key={item.id} className="cart-item">
                  <img src={imageUrl} alt={item.product.name} />
                  <div className="cart-item-info">
                    <h3>{item.product.name}</h3>
                    <p>Size: {item.size}</p>
                    <p className="price">${item.subtotal.toFixed(2)}</p>
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
              <span>{cart.total_items}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${cart.total_amount.toFixed(2)}</span>
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

