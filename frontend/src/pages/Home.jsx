import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [onSaleProducts, setOnSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featured, onSale] = await Promise.all([
        productsAPI.getFeatured(),
        productsAPI.getOnSale(),
      ]);
      setFeaturedProducts(featured.data);
      setOnSaleProducts(onSale.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-gray-600 font-sans-body">Loading...</p>
      </div>
    );
  }

  return (
    <div className="">
      {/* Hero Section */}
      <Hero/>
      {/* <section className="relative bg-[url('/hero_image.jpeg')] bg-cover bg-center py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif-heading text-5xl md:text-6xl text-[#1a1a2e] mb-6 tracking-wider">
            FASHION STORE
          </h1>
          <p className="text-lg text-gray-600 mb-8 font-sans-body max-w-2xl mx-auto">
            Discover the latest trends in fashion
          </p>
          <Link 
            to="/products" 
            className="inline-block border border-[#1a1a2e] text-[#1a1a2e] px-8 py-3 text-sm uppercase tracking-wider font-sans-body hover:bg-[#1a1a2e] hover:text-white transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section> */}


      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-10 bg-white">
          <div className="mx-auto sm:px-6 lg:px-8">
            <h2 className="font-serif-heading text-3xl md:text-4xl text-[#2b3349] mb-12 text-start tracking-wider">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* On Sale Products */}
      {onSaleProducts.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif-heading italic text-3xl md:text-4xl text-[#2b3349] mb-12 text-center tracking-wider">
            SKI & SUN SELECTION
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
              {onSaleProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-20 bg-white border-t border-[#efebe3]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif-heading text-3xl text-[#2b3349] mb-4 tracking-wider italic">
            Newsletter
          </h2>
          <p className="text-[#2b3349]/70 mb-8 font-sans-body">
            Be the first to know about our latest news and promotions.
          </p>
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 border-b border-gray-300 px-4 py-2 text-sm font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
            />
            <button className="text-[#2b3349] hover:text-[#2b3349]/70 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      
      <Footer/>
    </div>
  );
};

export default Home;
