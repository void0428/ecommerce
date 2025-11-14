import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Fashion Store
        </Link>
        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/products" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Products
          </Link>
          {user ? (
            <>
              <Link to="/cart" className="navbar-link cart-link" onClick={() => setMenuOpen(false)}>
                Cart ({cartCount})
              </Link>
              <Link to="/orders" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Orders
              </Link>
              <span className="navbar-link">Hello, {user.username}</span>
              <button className="navbar-link btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

