import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const response = await cartAPI.get();
      let cartData = response.data;
      if (Array.isArray(cartData) && cartData.length > 0) {
        cartData = cartData[0];
      }
      setCartCount(cartData?.total_items || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateCartCount = () => {
    fetchCartCount();
  };

  const value = {
    cartCount,
    updateCartCount,
    fetchCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

