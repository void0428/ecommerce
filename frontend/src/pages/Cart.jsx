import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

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
      console.log('Cart API Response:', response.data);
      let cartData = response.data;
      
      if (Array.isArray(cartData) && cartData.length > 0) {
        cartData = cartData[0];
      } else if (Array.isArray(cartData) && cartData.length === 0) {
        cartData = { items: [], total_items: 0, total_amount: 0 };
      }
      
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
      console.error('Error details:', error.response?.data);
      setCart({ items: [], total_items: 0, total_amount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await cartAPI.updateItem({ item_id: itemId, quantity: newQuantity });
      fetchCart();
      updateCartCount();
    } catch (error) {
      console.error('Error updating cart:', error);
      alert(error.response?.data?.error || 'Error updating cart item');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartAPI.removeItem({ item_id: itemId });
      fetchCart();
      updateCartCount();
    } catch (error) {
      console.error('Error removing item:', error);
      alert(error.response?.data?.error || 'Error removing cart item');
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-gray-600 font-sans-body">Loading...</p>
      </div>
    );
  }

  if (!cart || !cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif-heading text-4xl md:text-5xl text-[#1a1a2e] mb-12 text-center tracking-wider">
            Shopping Cart
          </h1>
          <div className="text-center py-20">
            <p className="text-gray-600 mb-8 font-sans-body">Your cart is empty</p>
            <Link 
              to="/products" 
              className="inline-block border border-[#1a1a2e] text-[#1a1a2e] px-8 py-3 text-sm uppercase tracking-wider font-sans-body hover:bg-[#1a1a2e] hover:text-white transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif-heading text-4xl md:text-5xl text-[#1a1a2e] mb-12 text-center tracking-wider">
          Shopping Cart
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => {
              const imageUrl = getImageUrl(item.product?.image);
              
              return (
                <div key={item.id} className="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-6">
                  <div className="w-full md:w-32 h-40 bg-gray-50 overflow-hidden flex-shrink-0">
                    <img 
                      src={imageUrl} 
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg text-[#1a1a2e] mb-2 font-sans-body uppercase tracking-wider">
                        {item.product?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 font-sans-body">Size: {item.size}</p>
                      <p className="text-lg text-[#1a1a2e] font-sans-body">
                        ${Number(item.subtotal || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:border-[#1a1a2e] transition-colors"
                        >
                          <span className="text-lg">-</span>
                        </button>
                        <span className="text-lg font-sans-body w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:border-[#1a1a2e] transition-colors"
                        >
                          <span className="text-lg">+</span>
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-gray-600 hover:text-red-600 font-sans-body uppercase tracking-wider underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 p-6 sticky top-32">
              <h2 className="font-serif-heading text-2xl text-[#1a1a2e] mb-6 tracking-wider">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm font-sans-body">
                  <span className="text-gray-600">Items:</span>
                  <span className="text-[#1a1a2e]">{cart.total_items || 0}</span>
                </div>
                <div className="flex justify-between text-lg font-sans-body border-t border-gray-200 pt-4">
                  <span className="text-[#1a1a2e] font-semibold">Total:</span>
                  <span className="text-[#1a1a2e] font-semibold">
                    ${Number(cart.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block w-full border border-[#1a1a2e] text-[#1a1a2e] px-8 py-4 text-sm uppercase tracking-wider font-sans-body hover:bg-[#1a1a2e] hover:text-white transition-colors text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
