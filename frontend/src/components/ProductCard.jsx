import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const imageUrl = getImageUrl(product.image);

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <div className="product-image">
          <img src={imageUrl} alt={product.name} />
          {product.discount_percentage > 0 && (
            <span className="discount-badge">-{product.discount_percentage}%</span>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.category?.name}</p>
          <div className="product-price">
            {product.discount_price ? (
              <>
                <span className="price-old">${product.price}</span>
                <span className="price-new">${product.final_price}</span>
              </>
            ) : (
              <span className="price">${product.final_price}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;

