import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
  const imageUrl = getImageUrl(product.image);

  return (
    <div className="group">
      <Link to={`/products/${product.id}`}>
        <div className="relative overflow-hidden bg-gray-50 aspect-[3/4] mb-4">
          <img 
            src={imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.discount_percentage > 0 && (
            <div className="absolute top-4 left-4 bg-[#1a1a2e] text-white px-3 py-1 text-xs font-semibold tracking-wider">
              -{product.discount_percentage}%
            </div>
          )}
          {product.is_featured && (
            <div className="absolute top-4 left-4 bg-[#1a1a2e] text-white px-3 py-1 text-xs font-semibold tracking-wider">
              NEW IN
            </div>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-sm font-sans-body text-[#1a1a2e] mb-1 uppercase tracking-wider">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2 font-sans-body">
            {product.category?.name}
          </p>
          <div className="flex items-center justify-center gap-2">
            {product.discount_price ? (
              <>
                <span className="text-xs text-gray-400 line-through font-sans-body">
                  ${product.price}
                </span>
                <span className="text-sm text-[#1a1a2e] font-sans-body">
                  ${product.final_price}
                </span>
              </>
            ) : (
              <span className="text-sm text-[#1a1a2e] font-sans-body">
                ${product.final_price}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
