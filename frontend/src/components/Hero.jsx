import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';

function Hero (){
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'NEW COLLECTION',
      subtitle: 'Spring/Summer 2024',
      cta: 'Shop Now',
      bgColor: 'bg-blue-300'
    },
    {
      title: 'PERSONALIZATION',
      subtitle: 'Create Your Unique Piece',
      cta: 'Shop Now',
      bgColor: 'bg-pink-300'
    },
    {
      title: 'HANDCRAFTED IN FRANCE',
      subtitle: 'Quality and Craftsmanship',
      cta: 'Shop Now',
      bgColor: 'bg-gray-300'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[750px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          } ${slide.bgColor}`}
        >
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-6xl md:text-7xl font-serif mb-4 tracking-wider">
                {slide.title}
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 tracking-wide">
                {slide.subtitle}
              </p>
              <Link to='/products'>
                <button className="bg-black text-white px-10 py-4 text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors">
                    {slide.cta}
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-black w-8' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Hero;
