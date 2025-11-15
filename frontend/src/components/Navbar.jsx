import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Menu, X, Search, User, ShoppingBag, Truck, LogOut, LogIn, NotebookPen } from 'lucide-react';

const Navbar = ({ isMenuOpen, setIsMenuOpen }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  const menuItems = [
    {
      name: 'PERSONALIZATION',
      items: ['T-Shirts', 'Hoodies', 'Accessories', 'All Products']
    },
    {
      name: 'WOMEN',
      items: ['New Arrivals', 'T-Shirts', 'Hoodies', 'Accessories', 'View All']
    },
    {
      name: 'MEN',
      items: ['New Arrivals', 'T-Shirts', 'Hoodies', 'Accessories', 'View All']
    },
    {
      name: 'ABOUT',
      items: ['Our Story', 'Our Commitment', 'Our Stores']
    }
  ];

  const [activeDropdown, setActiveDropdown] = useState(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50  shadow-sm" 
    onMouseLeave={() => setActiveDropdown(null)}
    >

      <div className="text-white bg-black">
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
                      <span className="absolute top-0 right-0 ">
                        0
                      </span>
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
              onMouseEnter={() => setActiveDropdown(index)}
            >
              <button className="text-sm font-medium tracking-wider hover:text-blue-300  py-2">
                {item.name}
              </button>
              {activeDropdown === index && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 text-white bg-black/80 shadow-lg border border-gray-100 rounded-md overflow-hidden">
                  {item.items.map((subItem) => (
                    <a
                      key={subItem}
                      href="#"
                      className="block px-4 py-3 text-sm hover:text-blue-300"
                    >
                      {subItem}
                    </a>
                  ))}
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
              <div key={item.name} className="mb-4">
                <h3 className="text-sm font-medium tracking-wider mb-2">{item.name}</h3>
                <div className="pl-4 space-y-2">
                  {item.items.map((subItem) => (
                    <a
                      key={subItem}
                      href="#"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {subItem}
                    </a>
                  ))}
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
    //               <span className="absolute -top-2 -right-2 bg-[#1a1a2e] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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

