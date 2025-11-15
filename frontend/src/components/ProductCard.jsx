import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
  const imageUrl = getImageUrl(product.image);

  return (
    <div className="group w-full">
      <Link to={`/products/${product.id}`}>
        {/* Card with fixed size 330x409, responsive */}
        <div className="relative overflow-hidden bg-white mb-4 w-full" 
             style={{
               aspectRatio: '600/750',
               maxWidth: '330px',
               margin: '0 auto'
             }}
        >
          <img 
            src={imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.discount_percentage > 0 && (
            <div className="absolute top-4 left-4 bg-[#2b3349] text-white px-3 py-1 text-xs font-semibold tracking-wider">
              -{product.discount_percentage}%
            </div>
          )}
          {product.is_featured && (
            <div className="absolute top-4 left-4 bg-[#2b3349] text-white px-3 py-1 text-xs font-semibold tracking-wider">
              NEW IN
            </div>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-sm font-sans-body text-[#2b3349] mb-1 uppercase tracking-wider">
            {product.name}
          </h3>
          <p className="text-xs text-[#2b3349]/70 mb-2 font-sans-body">
            {product.category?.name}
          </p>
          <div className="flex items-center justify-center gap-2">
            {product.discount_price ? (
              <>
                <span className="text-xs text-[#2b3349]/50 line-through font-sans-body">
                  ${product.price}
                </span>
                <span className="text-sm text-[#2b3349] font-sans-body">
                  ${product.final_price}
                </span>
              </>
            ) : (
              <span className="text-sm text-[#2b3349] font-sans-body">
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
