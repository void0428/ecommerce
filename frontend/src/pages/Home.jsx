import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import HorizontalCarousel from '../components/HorizontalCarousel';
import Hero from '../components/Hero';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [womenProducts, setWomenProducts] = useState([]);
  const [menProducts, setMenProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featuredRes, womenRes, menRes] = await Promise.all([
        productsAPI.getFeatured(),
        productsAPI.getAll({ gender: 'W', page: 1 }),
        productsAPI.getAll({ gender: 'M', page: 1 }),
      ]);

      const featured = featuredRes.data || [];
      const women = (womenRes.data.results || womenRes.data) || [];
      const men = (menRes.data.results || menRes.data) || [];

      setFeaturedProducts(Array.isArray(featured) ? featured : []);
      setWomenProducts(Array.isArray(women) ? women : []);
      setMenProducts(Array.isArray(men) ? men : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setFeaturedProducts([]);
      setWomenProducts([]);
      setMenProducts([]);
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
      <Hero/>


      {/* Featured Products - full width horizontal carousel */}
      <HorizontalCarousel
        title="Featured"
        products={featuredProducts.slice(0, 12)}
        direction="right"
        speed={36}
      />

      {/* Women Collection - horizontal carousel (renamed from SKI & SUN) */}
      <HorizontalCarousel
        title="Women Collection"
        products={womenProducts.slice(0, 12)}
        direction="left"
        speed={44}
      />

      {/* Men Collection - horizontal carousel */}
      <HorizontalCarousel
        title="Men Collection"
        products={menProducts.slice(0, 12)}
        direction="right"
        speed={40}
      />

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
              className="flex-1 border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
            />
            <button className="text-[#2b3349] hover:text-[#2b3349]/70 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
