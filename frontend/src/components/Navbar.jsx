import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';
import { Menu, X, Search, User, ShoppingBag, Truck, LogOut, LogIn, NotebookPen } from 'lucide-react';

const Navbar = ({ isMenuOpen, setIsMenuOpen }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesByGender, setCategoriesByGender] = useState({});
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [genderCategoriesLoading, setGenderCategoriesLoading] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [changeNavColor, setChangeNavColor] = useState(false);
  const [isHoveringNavbar, setIsHoveringNavbar] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const heroHalfRef = useRef(0);
  const isHoveringNavbarRef = useRef(false);
  const isHoveringDropdownRef = useRef(false);
  const location = useLocation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const changeBackground = () => {
    const heroHalf = heroHalfRef.current || 0;
    const scrolledPastHeroHalf = location.pathname !== '/' || window.scrollY >= heroHalf;
    // if hovering navbar or dropdown, force white
    if (isHoveringNavbarRef.current || isHoveringDropdownRef.current) {
      setChangeNavColor(true);
      return;
    }
    setChangeNavColor(!!scrolledPastHeroHalf);
  };

  useEffect(() => {
    // compute hero half and attach scroll listener
    const computeHeroHalf = () => {
      const hero = document.getElementById('home-hero');
      if (!hero) {
        heroHalfRef.current = 0;
        return;
      }
      const rect = hero.getBoundingClientRect();
      const scrollTop = window.scrollY || window.pageYOffset;
      const heroTop = rect.top + scrollTop;
      heroHalfRef.current = heroTop + hero.offsetHeight * 0.5;
    };

    computeHeroHalf();
    // set initial navbar state based on hero position
    changeBackground();
    const onScroll = () => changeBackground();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', computeHeroHalf);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', computeHeroHalf);
    };
  }, [location.pathname]);

  // keep refs in sync so scroll handler sees latest hover state
  useEffect(() => {
    isHoveringNavbarRef.current = isHoveringNavbar;
    isHoveringDropdownRef.current = isHoveringDropdown;
    // update immediately when hover state changes
    changeBackground();
  }, [isHoveringNavbar, isHoveringDropdown]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await productsAPI.getCategories();
      const categoriesData = response.data?.results || response.data || [];
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else {
        console.warn('Categories data is not an array:', categoriesData);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchCategoriesByGender = async (gender) => {
    if (categoriesByGender[gender]) {
      return;
    }

    setGenderCategoriesLoading(prev => ({ ...prev, [gender]: true }));
    try {
      const response = await productsAPI.getCategories(gender);
      const categoriesData = response.data?.results || response.data || [];
      if (Array.isArray(categoriesData)) {
        setCategoriesByGender(prev => ({
          ...prev,
          [gender]: categoriesData,
        }));
      } else {
        setCategoriesByGender(prev => ({
          ...prev,
          [gender]: [],
        }));
      }
    } catch (error) {
      console.error(`Error fetching categories for gender ${gender}:`, error);
      setCategoriesByGender(prev => ({
        ...prev,
        [gender]: [],
      }));
    } finally {
      setGenderCategoriesLoading(prev => ({ ...prev, [gender]: false }));
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleViewAllClick = () => {
    navigate('/products');
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleGenderClick = (gender) => {
    navigate(`/products?gender=${gender}`);
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleViewAllGenderClick = (gender) => {
    navigate(`/products?gender=${gender}`);
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const menuItems = [
    {
      name: 'PERSONALIZATION',
      type: 'categories',
      items: categories,
    },
    {
      name: 'WOMEN',
      type: 'gender',
      gender: 'W',
    },
    {
      name: 'MEN',
      type: 'gender',
      gender: 'M',
    },
    {
      name: 'Unisex',
      type: 'gender',
      gender: 'U',
    },
  ];

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 shadow-sm" 
      onMouseEnter={() => setIsHoveringNavbar(true)}
      onMouseLeave={() => { setIsHoveringNavbar(false); setActiveDropdown(null); setIsHoveringDropdown(false); }}
    >
      {/* Main Navbar */}
      <div className={`${changeNavColor ? 'text-[#2b3349] bg-white' : 'text-white bg-transparent'} hover:bg-white hover:text-[#2b3349] transition-colors duration-300`}>
        <div className="flex items-center justify-between p-3">
          {/* Mobile Menu Button */}
          <div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Center Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="font-serif-heading font-extrabold text-5xl tracking-wider">
              FitZone
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/cart" className="text-lg uppercase tracking-wider font-sans-body">
                  <button title='Cart' className="p-2 hover:border-b rounded-md transition-colors relative">
                    <ShoppingBag size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 text-[#2b3349] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </Link>

                <Link to="/orders" className="text-lg uppercase tracking-wider font-sans-body">
                  <button title='Orders' className="p-2 hover:border-b rounded-md transition-colors">
                    <Truck size={20} />
                  </button>
                </Link>

                <Link to="/" className="text-lg uppercase tracking-wider font-sans-body">
                  <button title={user.username} className="p-2 hover:border-b rounded-md transition-colors">
                    <User size={20} />
                  </button>
                </Link>

                <button onClick={handleLogout} className="text-lg uppercase tracking-wider font-sans-body">
                  <button title={user.username} className="p-2 hover:border-b rounded-md transition-colors">
                    <LogOut size={20} />
                  </button>
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="text-lg uppercase tracking-wider hover:border-b font-sans-body">
                  <button title='Sign-Up' className="p-2 rounded-md transition-colors flex flex-col items-center justify-center">
                    <NotebookPen size={20} />
                  </button>
                </Link>
                <Link to="/login" className="text-lg uppercase tracking-wider hover:border-b font-sans-body">
                  <button title='Login' className="p-2 rounded-md transition-colors flex flex-col items-center justify-center">
                    <LogIn size={20} />
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex justify-center items-center space-x-5 pb-4">
          {menuItems.map((item, index) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => {
                setActiveDropdown(index);
                setIsHoveringDropdown(true);
                if (item.type === 'gender') {
                  fetchCategoriesByGender(item.gender);
                }
              }}
              onMouseLeave={() => setIsHoveringDropdown(false)}
            >
              <button 
                className={`text-lg font-medium tracking-wider py-2 transition-all ${
                  activeDropdown === index ? 'border-b-2 border-current' : ''
                }`}
              >
                {item.name}
              </button>
            </div>
          ))}
        </nav>
      </div>
   

      {/* Mega Menu Dropdown */}
      <div
        className={`absolute top-full left-0 w-full bg-white border-b border-gray-200 transition-all duration-300 ease-in-out overflow-hidden z-50 ${
          activeDropdown !== null ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseEnter={() => setIsHoveringDropdown(true)}
        onMouseLeave={() => { setIsHoveringDropdown(false); setActiveDropdown(null); }}
        style={{ 
          height: activeDropdown !== null ? '30vh' : '0',
          boxShadow: activeDropdown !== null ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        {activeDropdown !== null && menuItems[activeDropdown] && (
          <div className="max-w-7xl mx-auto px-8 py-12 h-full overflow-y-auto">
            <div className="grid grid-cols-4 gap-8">
              {menuItems[activeDropdown].type === 'categories' ? (
                // PERSONALIZATION - Show all categories
                <div className="col-span-4">
                  <h3 className="font-semibold text-xs tracking-wider mb-4 text-[#2b3349]">
                    ALL CATEGORIES
                  </h3>
                  {categoriesLoading ? (
                    <div className="text-lg text-gray-500">Loading categories...</div>
                  ) : categories.length > 0 ? (
                    <div className="grid grid-cols-4 gap-6">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category.id)}
                          className="text-left text-lg text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          {category.name}
                        </button>
                      ))}
                      <button
                        onClick={handleViewAllClick}
                        className="text-left text-lg text-blue-600 hover:text-blue-800 transition-colors font-semibold"
                      >
                        View All Products →
                      </button>
                    </div>
                  ) : (
                    <div className="text-lg text-gray-500">No categories available</div>
                  )}
                </div>
              ) : menuItems[activeDropdown].type === 'gender' ? (
                // WOMEN, MEN, UNISEX - Show gender-specific categories
                <div className="col-span-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-xs tracking-wider text-[#2b3349]">
                      {menuItems[activeDropdown].name} CATEGORIES
                    </h3>
                    <button
                      onClick={() => handleViewAllGenderClick(menuItems[activeDropdown].gender)}
                      className="text-lg text-blue-600 hover:text-blue-800 transition-colors font-semibold"
                    >
                      View All {menuItems[activeDropdown].name} →
                    </button>
                  </div>
                  {genderCategoriesLoading[menuItems[activeDropdown].gender] ? (
                    <div className="text-lg text-gray-500">Loading categories...</div>
                  ) : categoriesByGender[menuItems[activeDropdown].gender] && 
                     categoriesByGender[menuItems[activeDropdown].gender].length > 0 ? (
                    <div className="grid grid-cols-4 gap-6">
                      {categoriesByGender[menuItems[activeDropdown].gender].map((category) => (
                        <button
                          key={category.id}
                          onClick={() => navigate(`/products?gender=${menuItems[activeDropdown].gender}&category=${category.id}`)}
                          className="text-left text-lg text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-lg text-gray-500">No categories available</div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            {menuItems.map((item) => (
              <div 
                key={item.name} 
                className="mb-4"
                onMouseEnter={() => {
                  if (item.type === 'gender') {
                    fetchCategoriesByGender(item.gender);
                  }
                }}
              >
                <h3 className="text-lg font-medium tracking-wider mb-2 text-[#2b3349]">{item.name}</h3>
                <div className="pl-4 space-y-2">
                  {item.type === 'categories' ? (
                    <>
                      {categoriesLoading ? (
                        <div className="text-lg text-gray-500">Loading categories...</div>
                      ) : categories.length > 0 ? (
                        <>
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className="block w-full text-left text-lg text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              {category.name}
                            </button>
                          ))}
                          <button
                            onClick={handleViewAllClick}
                            className="block w-full text-left text-lg text-gray-600 hover:text-blue-600 transition-colors font-semibold mt-2"
                          >
                            View All Products
                          </button>
                        </>
                      ) : (
                        <div className="text-lg text-gray-500">No categories available</div>
                      )}
                    </>
                  ) : item.type === 'gender' ? (
                    <>
                      <button
                        onClick={() => {
                          handleViewAllGenderClick(item.gender);
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left text-lg text-gray-600 hover:text-blue-600 transition-colors font-semibold"
                      >
                        View All {item.name}
                      </button>
                      {genderCategoriesLoading[item.gender] ? (
                        <div className="text-lg text-gray-500">Loading categories...</div>
                      ) : categoriesByGender[item.gender] && categoriesByGender[item.gender].length > 0 ? (
                        categoriesByGender[item.gender].map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              navigate(`/products?gender=${item.gender}&category=${category.id}`);
                              setIsMenuOpen(false);
                            }}
                            className="block w-full text-left text-lg text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            {category.name}
                          </button>
                        ))
                      ) : (
                        <div className="text-lg text-gray-500">No categories available</div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

 export default Navbar;