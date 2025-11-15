import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

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
      console.log('Add to cart response:', response.data);
      setMessage('Product added to cart!');
      updateCartCount();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Error adding to cart';
      setMessage(errorMessage);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-gray-600 font-sans-body">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-red-600 font-sans-body">Product not found</p>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.image);
  const sizes = product.available_sizes.split(',').map(s => s.trim());

  return (
    <div className="pt-32 pb-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-gray-50 aspect-[3/4] overflow-hidden">
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="font-serif-heading text-3xl md:text-4xl text-[#1a1a2e] mb-4 tracking-wider">
              {product.name}
            </h1>
            <p className="text-sm text-gray-500 mb-6 font-sans-body uppercase tracking-wider">
              {product.category?.name}
            </p>
            
            <div className="flex items-center gap-4 mb-6">
              {product.discount_price ? (
                <>
                  <span className="text-lg text-gray-400 line-through font-sans-body">
                    ${product.price}
                  </span>
                  <span className="text-2xl text-[#1a1a2e] font-sans-body">
                    ${product.final_price}
                  </span>
                  <span className="bg-[#1a1a2e] text-white px-3 py-1 text-xs font-semibold tracking-wider">
                    -{product.discount_percentage}%
                  </span>
                </>
              ) : (
                <span className="text-2xl text-[#1a1a2e] font-sans-body">
                  ${product.final_price}
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-8 font-sans-body leading-relaxed">
              {product.description}
            </p>

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-3 font-sans-body uppercase tracking-wider">
                Size
              </label>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-2 border text-sm font-sans-body uppercase tracking-wider transition-colors ${
                      selectedSize === size
                        ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white'
                        : 'border-gray-300 text-[#1a1a2e] hover:border-[#1a1a2e]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="mb-8">
              <label className="block text-sm text-gray-700 mb-3 font-sans-body uppercase tracking-wider">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:border-[#1a1a2e] transition-colors"
                >
                  <span className="text-lg">-</span>
                </button>
                <span className="text-lg font-sans-body w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:border-[#1a1a2e] transition-colors"
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 text-sm font-sans-body ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full border border-[#1a1a2e] text-[#1a1a2e] px-8 py-4 text-sm uppercase tracking-wider font-sans-body hover:bg-[#1a1a2e] hover:text-white transition-colors mb-8"
            >
              Add to Cart
            </button>

            {/* Product Meta */}
            <div className="border-t border-gray-200 pt-6 space-y-2">
              <p className="text-sm text-gray-600 font-sans-body">
                <strong>Gender:</strong> {
                  product.gender === 'M' ? 'Men' : 
                  product.gender === 'W' ? 'Women' : 
                  'Unisex'
                }
              </p>
              <p className="text-sm text-gray-600 font-sans-body">
                <strong>Stock:</strong> {product.stock} available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
