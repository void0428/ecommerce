import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

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
      console.log('Checkout cart response:', response.data);
      let cartData = response.data;
      if (Array.isArray(cartData) && cartData.length > 0) {
        cartData = cartData[0];
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
      updateCartCount();
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
      <div className="pt-32 pb-20 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-red-600 font-sans-body">Your cart is empty</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif-heading text-4xl md:text-5xl text-[#1a1a2e] mb-12 text-center tracking-wider">
          Checkout
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="font-serif-heading text-2xl text-[#1a1a2e] mb-6 tracking-wider">
                Shipping Information
              </h2>
              <div>
                <label className="block text-sm text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
                  Shipping Address *
                </label>
                <textarea
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Enter your complete shipping address"
                  className="w-full border-b border-gray-300 px-4 py-2 text-sm font-sans-body focus:border-[#1a1a2e] outline-none bg-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                  className="w-full border-b border-gray-300 px-4 py-2 text-sm font-sans-body focus:border-[#1a1a2e] outline-none bg-transparent"
                />
              </div>
              {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 text-sm font-sans-body">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full border border-[#1a1a2e] text-[#1a1a2e] px-8 py-4 text-sm uppercase tracking-wider font-sans-body hover:bg-[#1a1a2e] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="border border-gray-200 p-6 sticky top-32">
              <h2 className="font-serif-heading text-2xl text-[#1a1a2e] mb-6 tracking-wider">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-200">
                    <div className="flex-1">
                      <strong className="text-sm text-[#1a1a2e] font-sans-body block mb-1">
                        {item.product?.name || 'Product'}
                      </strong>
                      <p className="text-xs text-gray-600 font-sans-body">
                        Size: {item.size} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm text-[#1a1a2e] font-sans-body">
                      ${Number(item.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
