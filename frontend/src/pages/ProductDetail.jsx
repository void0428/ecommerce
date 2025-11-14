import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateCartCount } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);
      const sizes = response.data.available_sizes.split(',');
      if (sizes.length > 0) {
        setSelectedSize(sizes[0].trim());
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await cartAPI.addItem({
        product_id: product.id,
        quantity,
        size: selectedSize,
      });
      console.log('Add to cart response:', response.data); // Debug log
      setMessage('Product added to cart!');
      updateCartCount(); // Update cart count in navbar
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error details:', error.response?.data); // Debug log
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Error adding to cart';
      setMessage(errorMessage);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  const imageUrl = getImageUrl(product.image);

  const sizes = product.available_sizes.split(',').map(s => s.trim());

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-layout">
          <div className="product-image-section">
            <img src={imageUrl} alt={product.name} />
          </div>
          <div className="product-info-section">
            <h1>{product.name}</h1>
            <p className="product-category">{product.category?.name}</p>
            <div className="product-price">
              {product.discount_price ? (
                <>
                  <span className="price-old">${product.price}</span>
                  <span className="price-new">${product.final_price}</span>
                  <span className="discount-badge">-{product.discount_percentage}%</span>
                </>
              ) : (
                <span className="price">${product.final_price}</span>
              )}
            </div>
            <p className="product-description">{product.description}</p>
            <div className="product-options">
              <div className="option-group">
                <label>Size</label>
                <div className="size-options">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="option-group">
                <label>Quantity</label>
                <div className="quantity-control">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>
            </div>
            {message && (
              <div className={message.includes('Error') ? 'error' : 'success'}>
                {message}
              </div>
            )}
            <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <div className="product-meta">
              <p><strong>Gender:</strong> {
                product.gender === 'M' ? 'Men' : 
                product.gender === 'W' ? 'Women' : 
                'Unisex'
              }</p>
              <p><strong>Stock:</strong> {product.stock} available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

