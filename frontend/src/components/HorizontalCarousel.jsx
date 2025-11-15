import React, { useRef, useEffect } from 'react';
import ProductCard from './ProductCard';

const HorizontalCarousel = ({ title, products = [], direction = 'right', speed = 100 }) => {
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const pauseTimeout = useRef(null);

  useEffect(() => {
    const cont = containerRef.current;
    if (!cont) return;

    const pause = () => {
      if (animRef.current) animRef.current.style.animationPlayState = 'paused';
      if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
    };

    const resume = () => {
      if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
      pauseTimeout.current = setTimeout(() => {
        if (animRef.current) animRef.current.style.animationPlayState = 'running';
      }, 900);
    };

    cont.addEventListener('mouseenter', pause);
    cont.addEventListener('mouseleave', resume);
    cont.addEventListener('pointerdown', pause);
    cont.addEventListener('pointerup', resume);
    cont.addEventListener('scroll', () => {
      pause();
      resume();
    }, { passive: true });

    return () => {
      cont.removeEventListener('mouseenter', pause);
      cont.removeEventListener('mouseleave', resume);
      cont.removeEventListener('pointerdown', pause);
      cont.removeEventListener('pointerup', resume);
      cont.removeEventListener('scroll', () => {});
      if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
    };
  }, []);

  if (!products || products.length === 0) return null;

  const items = products;
  const cardWidth = 360; // Increased card size
  const gapPixels = 5; // Gap between cards on x-axis only
  const totalPerCard = cardWidth + gapPixels;
  
  // Calculate duration based on single set width
  const singleSetWidth = items.length * totalPerCard;
  const duration = singleSetWidth / (speed * 10);

  return (
    <div className="w-full overflow-hidden py-8">
      <div className="max-w-7xl mx-auto px-0">
        <h2 
          className="font-serif-heading text-2xl text-[#2b3349] mb-4 tracking-wider text-left pl-4"
          style={{ wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}
        >
          {title}
        </h2>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className="carousel-viewport"
          style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
        >
          <div
            ref={animRef}
            className={`carousel-track ${direction === 'left' ? 'dir-left' : 'dir-right'}`}
            style={{ 
              animationDuration: `${duration}s`,
              gap: `${gapPixels}px`
            }}
          >
            {/* Duplicate items multiple times for seamless loop */}
            {[...Array(3)].map((_, setIndex) => (
              <div key={`set-${setIndex}`} className="carousel-group">
                {items.map((p) => (
                  <div key={`${setIndex}-${p.id}`} className="carousel-item">
                    <div style={{ minWidth: cardWidth }} className="shrink-0">
                      <ProductCard product={p} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full mt-4">
          <div className="h-px bg-[#e6e6e6] w-full" />
        </div>
      </div>

      <style>{`
        .carousel-viewport { 
          scrollbar-width: none; 
          -ms-overflow-style: none;
        }
        .carousel-viewport::-webkit-scrollbar { display: none; }
        
        .carousel-track { 
          display: flex; 
          width: max-content; 
          align-items: flex-start;
          gap: ${gapPixels}px;
        }
        
        .carousel-group { 
          display: flex; 
          gap: ${gapPixels}px;
        }
        
        .carousel-item { 
          display: flex; 
          align-items: flex-start;
          flex-shrink: 0;
        }

        .carousel-track.dir-right { 
          animation: scroll-right ${duration}s linear infinite;
        }
        
        .carousel-track.dir-left { 
          animation: scroll-left ${duration}s linear infinite;
        }

        @keyframes scroll-left { 
          from { 
            transform: translateX(0); 
          } 
          to { 
            transform: translateX(calc(-${singleSetWidth}px - ${gapPixels}px)); 
          }
        }
        
        @keyframes scroll-right { 
          from { 
            transform: translateX(calc(-${singleSetWidth}px - ${gapPixels}px)); 
          } 
          to { 
            transform: translateX(0); 
          }
        }

        .carousel-viewport:hover .carousel-track { 
          animation-play-state: paused; 
        }
      `}</style>
    </div>
  );
};

export default HorizontalCarousel;