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
    first_name: '',
    last_name: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
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
      const checkoutData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        shipping_address: `${formData.street_address}, ${formData.city}, ${formData.state} ${formData.postal_code}, ${formData.country}`,
        phone_number: formData.phone_number,
      };
      const response = await cartAPI.checkout(checkoutData);
      updateCartCount();
      navigate(`/orders`);
    } catch (error) {
      console.error('Checkout error:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.error || 'Checkout failed. Please try again.';
      
      // Check if error is due to email not verified
      if (error.response?.status === 403 && errorMessage.includes('verify')) {
        setError(
          <>
            {errorMessage}
            <div className="mt-4">
              <button
                onClick={() => navigate('/verify-email', { state: { email: user?.email } })}
                className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-base font-sans-body"
              >
                Verify Email
              </button>
            </div>
          </>
        );
      } else {
        setError(errorMessage);
      }
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
        <h1 className="font-serif-heading text-4xl md:text-5xl text-[#2b3349] mb-12 text-center tracking-wider flex flex-col items-center">
          Checkout
          <p className='text-xs'>(Cash On delivery)</p>
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="font-serif-heading text-3xl font-bold text-[#2b3349] mb-6 tracking-wider">
                Shipping Information
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="First name"
                    className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Last name"
                    className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleChange}
                  required
                  placeholder="House number and street name"
                  className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="City"
                    className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="State"
                    className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    required
                    placeholder="Postal code"
                    className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    placeholder="Country"
                    className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                  className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
                />
              </div>
              {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 text-base font-sans-body">
                  <div>
                    {typeof error === 'string' ? error : error?.props?.children?.[0] || 'An error occurred'}
                  </div>
                  {error?.props?.children?.[1]}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full border border-[#2b3349] text-[#2b3349] px-8 py-4 text-base uppercase tracking-wider font-sans-body hover:bg-[#2b3349] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="border border-gray-200 p-6 sticky top-32">
              <h2 className="font-serif-heading text-3xl font-bold text-[#2b3349] mb-6 tracking-wider">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-200">
                    <div className="flex-1">
                      <strong className="text-base text-[#2b3349] font-sans-body block mb-1">
                        {item.product?.name || 'Product'}
                      </strong>
                      <p className="text-xs text-gray-600 font-sans-body">
                        Size: {item.size} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-base text-[#2b3349] font-sans-body">
                      ₹{Number(item.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-base font-sans-body">
                  <span className="text-gray-600">Items:</span>
                  <span className="text-[#2b3349]">{cart.total_items || 0}</span>
                </div>
                <div className="flex justify-between text-xl font-sans-body border-t border-gray-200 pt-4">
                  <span className="text-[#2b3349] font-semibold">Total:</span>
                  <span className="text-[#2b3349] font-semibold">
                    ₹{Number(cart.total_amount || 0).toFixed(2)}
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
