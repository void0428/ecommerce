import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';
import { Menu, X, Search, User, ShoppingBag, Truck, LogOut, LogIn, NotebookPen } from 'lucide-react';

const Navbar = ({ isMenuOpen, setIsMenuOpen }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]); // All categories for PERSONALIZATION
  const [categoriesByGender, setCategoriesByGender] = useState({}); // Categories filtered by gender
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [genderCategoriesLoading, setGenderCategoriesLoading] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [changeNavColor, setChangeNavColor] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const changeBackground = () => {
    if (window.scrollY > 500) {  // hero height or offset
      setChangeNavColor(true);
    } else {
      setChangeNavColor(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
    return () => window.removeEventListener("scroll", changeBackground);
  }, []);

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
    // If we already have categories for this gender, don't fetch again
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

  // Menu items configuration
  const menuItems = [
    {
      name: 'PERSONALIZATION',
      type: 'categories', // Shows all categories
      items: categories,
    },
    {
      name: 'WOMEN',
      type: 'gender', // Filters by gender
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
      gender: 'U', // Kids gender from the model
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50  shadow-sm" 
    onMouseLeave={() => setActiveDropdown(null)}
    >

      <div className={`${changeNavColor ? 'text-[#2b3349] bg-white' : 'text-white bg-transparent'} hover:bg-white hover:text-[#2b3349]`}>
        <div className="flex items-center justify-between p-3">

          <div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />} 
            </button>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="font-serif-heading text-4xl tracking-wider">
            FitZone
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/cart" className="text-sm uppercase tracking-wider font-sans-body">
                  <button title='Cart' className="p-2 hover:border-b rounded-md transition-colors relative">
                      <ShoppingBag size={20} />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 text-[#2b3349] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                  </button>
                </Link>

                <Link to="/orders" className="text-sm uppercase tracking-wider  font-sans-body">
                  <button title='Orders' className="p-2 hover:border-b rounded-md transition-colors">
                    <Truck size={20} />
                  </button>
                </Link>

                <Link to="/" className="text-sm uppercase tracking-wider  font-sans-body">
                  <button title={user.username} className="p-2 hover:border-b rounded-md transition-colors">
                    <User size={20} />
                  </button>
                </Link>

                <button onClick={handleLogout} className="text-sm uppercase tracking-wider font-sans-body">
                <button title={user.username} className="p-2 hover:border-b rounded-md transition-colors">
                    <LogOut size={20} />
                  </button>
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="text-sm uppercase tracking-wider  hover:border-b font-sans-body">
                <button title='Sign-Up' className="p-2 rounded-md transition-colors flex flex-col items-center justify-center ">
                      <NotebookPen size={20} />
                      {/* <span className="">
                        Register
                      </span> */}
                  </button>
                </Link>
                <Link to="/login" className="text-sm uppercase tracking-wider  hover:border-b font-sans-body">
                <button title='Login' className="p-2  rounded-md transition-colors flex flex-col items-center justify-center ">
                      <LogIn size={20} />
                      {/* <span className="">
                        login
                      </span> */}
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="hidden lg:flex justify-center items-center space-x-12 pb-4">
          {menuItems.map((item, index) => (
            <div
              key={item.name}
              className="relative hover:text-blue-300"
              onMouseEnter={() => {
                setActiveDropdown(index);
                // Fetch gender-specific categories when hovering
                if (item.type === 'gender') {
                  fetchCategoriesByGender(item.gender);
                }
              }}
            >
              
              <button className="text-sm font-medium tracking-wider hover:text-blue-300 py-2">
                {item.name}
              </button>
              {activeDropdown === index && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 text-[#2b3349] bg-black/80 shadow-lg border border-gray-100 rounded-md overflow-hidden">
                  {item.type === 'categories' ? (
                    // PERSONALIZATION - Show all categories
                    <>
                      {categoriesLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-400">Loading...</div>
                      ) : categories.length > 0 ? (
                        <>
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className="block w-full text-left px-4 py-3 text-sm hover:text-blue-300 hover:bg-black/60 transition-colors"
                            >
                              {category.name}
                            </button>
                          ))}
                          <button
                            onClick={handleViewAllClick}
                            className="block w-full text-left px-4 py-3 text-sm hover:text-blue-300 hover:bg-black/60 transition-colors border-t border-gray-700"
                          >
                            View All Products
                          </button>
                        </>
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-400">No categories available</div>
                      )}
                    </>
                  ) : item.type === 'gender' ? (
                    // WOMEN, MEN, KIDS - Show gender-specific categories
                    <>
                      <button
                        onClick={() => handleViewAllGenderClick(item.gender)}
                        className="block w-full text-left px-4 py-3 text-sm hover:text-blue-300 hover:bg-black/60 transition-colors"
                      >
                        View All {item.name}
                      </button>
                      {genderCategoriesLoading[item.gender] ? (
                        <div className="px-4 py-3 text-sm text-gray-400">Loading...</div>
                      ) : categoriesByGender[item.gender] && categoriesByGender[item.gender].length > 0 ? (
                        <>
                          {categoriesByGender[item.gender].map((category) => (
                            <button
                              key={category.id}
                              onClick={() => navigate(`/products?gender=${item.gender}&category=${category.id}`)}
                              className="block w-full text-left px-4 py-3 text-sm hover:text-blue-300 hover:bg-black/60 transition-colors"
                            >
                              {category.name}
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-400">No categories available</div>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            {menuItems.map((item) => (
              <div 
                key={item.name} 
                className="mb-4"
                onMouseEnter={() => {
                  // Fetch gender-specific categories when menu opens
                  if (item.type === 'gender') {
                    fetchCategoriesByGender(item.gender);
                  }
                }}
              >
                <h3 className="text-sm font-medium tracking-wider mb-2 text-[#2b3349]">{item.name}</h3>
                <div className="pl-4 space-y-2">
                  {item.type === 'categories' ? (
                    // PERSONALIZATION - Show all categories
                    <>
                      {categoriesLoading ? (
                        <div className="text-sm text-gray-500">Loading categories...</div>
                      ) : categories.length > 0 ? (
                        <>
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              {category.name}
                            </button>
                          ))}
                          <button
                            onClick={handleViewAllClick}
                            className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 transition-colors font-semibold mt-2"
                          >
                            View All Products
                          </button>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">No categories available</div>
                      )}
                    </>
                  ) : item.type === 'gender' ? (
                    // WOMEN, MEN, KIDS - Show gender-specific categories
                    <>
                      <button
                        onClick={() => {
                          handleViewAllGenderClick(item.gender);
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 transition-colors font-semibold"
                      >
                        View All {item.name}
                      </button>
                      {genderCategoriesLoading[item.gender] ? (
                        <div className="text-sm text-gray-500">Loading categories...</div>
                      ) : categoriesByGender[item.gender] && categoriesByGender[item.gender].length > 0 ? (
                        categoriesByGender[item.gender].map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              navigate(`/products?gender=${item.gender}&category=${category.id}`);
                              setIsMenuOpen(false);
                            }}
                            className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            {category.name}
                          </button>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No categories available</div>
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


// Old layout:
  // <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
    //   {/* Top Bar */}
    //   <div className="border-b border-gray-200">
    //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //       <div className="flex justify-between items-center h-10 text-xs text-gray-600">
    //         <div className="flex items-center gap-4">
    //           <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
    //             <span>India (INR ₹)</span>
    //             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    //             </svg>
    //           </div>
    //           <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
    //             <span>English</span>
    //             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    //             </svg>
    //           </div>
    //         </div>
    //         <div className="flex items-center gap-4">
    //           <button className="hover:text-gray-900 transition-colors">
    //             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    //             </svg>
    //           </button>
    //           <Link to="/cart" className="relative hover:text-gray-900 transition-colors">
    //             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    //             </svg>
    //             {cartCount > 0 && (
    //               <span className="absolute -top-2 -right-2 bg-[#1a1a2e] text-[#2b3349] text-xs rounded-full w-5 h-5 flex items-center justify-center">
    //                 {cartCount}
    //               </span>
    //             )}
    //           </Link>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Main Navigation */}
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //     <div className="flex justify-between items-center h-20">
    //       {/* Logo */}
    //       <Link to="/" className="font-serif-heading text-2xl text-[#1a1a2e] tracking-wider">
    //         FASHION STORE
    //       </Link>

    //       {/* Desktop Navigation */}
    //       <div className="hidden md:flex items-center gap-8">
    //         <Link to="/products" className="text-sm uppercase tracking-wider text-[#1a1a2e] hover:underline font-sans-body">
    //           Products
    //         </Link>
            // {user ? (
            //   <>
            //     <Link to="/cart" className="text-sm uppercase tracking-wider text-[#1a1a2e] hover:underline font-sans-body">
            //       Cart
            //     </Link>
            //     <Link to="/orders" className="text-sm uppercase tracking-wider text-[#1a1a2e] hover:underline font-sans-body">
            //       Orders
            //     </Link>
            //     <span className="text-sm text-gray-600 font-sans-body">{user.username}</span>
            //     <button onClick={handleLogout} className="text-sm uppercase tracking-wider text-[#1a1a2e] hover:underline font-sans-body">
            //       Logout
            //     </button>
            //   </>
            // ) : (
            //   <>
            //     <Link to="/login" className="text-sm uppercase tracking-wider text-[#1a1a2e] hover:underline font-sans-body">
            //       Login
            //     </Link>
            //     <Link to="/register" className="text-sm uppercase tracking-wider text-[#1a1a2e] hover:underline font-sans-body">
            //       Register
            //     </Link>
            //   </>
            // )}
    //       </div>

    //       {/* Mobile Menu Button */}
    //       <button
    //         className="md:hidden flex flex-col gap-1.5"
    //         onClick={() => setMenuOpen(!menuOpen)}
    //       >
    //         <span className={`w-6 h-px bg-[#1a1a2e] transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
    //         <span className={`w-6 h-px bg-[#1a1a2e] transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
    //         <span className={`w-6 h-px bg-[#1a1a2e] transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
    //       </button>
    //     </div>
    //   </div>

    //   {/* Mobile Menu */}
    //   {menuOpen && (
    //     <div className="md:hidden border-t border-gray-200 bg-white">
    //       <div className="px-4 py-4 space-y-4">
    //         <Link to="/products" className="block text-sm uppercase tracking-wider text-[#1a1a2e] font-sans-body" onClick={() => setMenuOpen(false)}>
    //           Products
    //         </Link>
    //         {user ? (
    //           <>
    //             <Link to="/cart" className="block text-sm uppercase tracking-wider text-[#1a1a2e] font-sans-body" onClick={() => setMenuOpen(false)}>
    //               Cart
    //             </Link>
    //             <Link to="/orders" className="block text-sm uppercase tracking-wider text-[#1a1a2e] font-sans-body" onClick={() => setMenuOpen(false)}>
    //               Orders
    //             </Link>
    //             <span className="block text-sm text-gray-600 font-sans-body">{user.username}</span>
    //             <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block text-sm uppercase tracking-wider text-[#1a1a2e] font-sans-body">
    //               Logout
    //             </button>
    //           </>
    //         ) : (
    //           <>
    //             <Link to="/login" className="block text-sm uppercase tracking-wider text-[#1a1a2e] font-sans-body" onClick={() => setMenuOpen(false)}>
    //               Login
    //             </Link>
    //             <Link to="/register" className="block text-sm uppercase tracking-wider text-[#1a1a2e] font-sans-body" onClick={() => setMenuOpen(false)}>
    //               Register
    //             </Link>
    //           </>
    //         )}
    //       </div>
    //     </div>
    //   )}
    // </nav>
};

export default Navbar;

