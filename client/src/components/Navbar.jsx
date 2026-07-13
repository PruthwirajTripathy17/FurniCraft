import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { AuthContext } from "../context/auth-context";
import { FcSearch } from "react-icons/fc";
import { FaHeart } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { FiMenu, FiX, FiTrash2, FiPlus, FiMinus, FiUser, FiLogOut, FiShoppingCart, FiPackage } from "react-icons/fi";
import logo from "../assets/furnicraftlogo.png";
import Swal from "sweetalert2";

const Navbar = () => {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const {
    cart,
    wishlist,
    searchQuery,
    setSearchQuery,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleWishlist,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
  } = useContext(ShopContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/" && location.state?.scrollTo) {
      const id = location.state.scrollTo;
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
      // Clear the navigation state
      navigate("/", { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleNavLink = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
    } else {
      if (sectionId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleNavLink("shop");
  };

  const menuItems = [
    { label: "Home", section: "home" },
    { label: "Shop", section: "shop" },
    { label: "About", section: "about" },
    { label: "Blog", section: "blog" },
    { label: "Contact", section: "contact" },
  ];

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => {
    const discount = Number(item.discount || 0);
    const itemPrice = discount > 0 ? item.price - (item.price * discount) / 100 : item.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  return (
    <>
      <nav className="sticky top-0 z-[200] border-b border-zinc-100 bg-white/95 backdrop-blur-md px-5 py-4 shadow-[0_2px_16px_rgba(0,0,0,.05)] lg:px-12 transition-all">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-6">

          <Link
            to="/"
            onClick={() => handleNavLink("home")}
            className="flex items-center gap-3 text-xl font-black tracking-wide text-brand-dark cursor-pointer group"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-brand-brown text-base font-black text-white overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="FurniCraft" className="h-full w-full object-cover" />
            </div>
            <span className="bg-gradient-to-r from-brand-dark to-brand-brown bg-clip-text text-transparent">
              FurniCraft
            </span>
          </Link>


          <div className="hidden items-center gap-8 text-sm font-medium lg:flex">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavLink(item.section)}
                className="relative pb-1 text-brand-dark transition-colors hover:text-brand-brown font-semibold after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-brand-brown after:transition-all hover:after:w-full"
              >
                {item.label}
              </button>
            ))}
          </div>


          <div className="flex items-center gap-4">

            <form onSubmit={handleSearchSubmit} className="hidden items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 md:flex border border-transparent focus-within:border-zinc-300 focus-within:bg-white transition-all relative">
              <FcSearch className="text-lg" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-28 bg-transparent text-sm outline-none placeholder:text-zinc-400 focus:w-40 transition-all duration-300 pr-5"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <FiX size={14} />
                </button>
              )}
            </form>

            <div className="flex items-center gap-4 text-zinc-700">

              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative flex items-center justify-center hover:text-brand-brown transition-colors active:scale-95 duration-200"
                aria-label="Open wishlist"
              >
                <FaHeart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute -right-2.5 -top-2.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brand-brown text-[9px] font-bold text-white shadow-sm">
                    {wishlist.length}
                  </span>
                )}
              </button>


              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center hover:text-brand-brown transition-colors active:scale-95 duration-200"
                aria-label="Open cart"
              >
                <FaCartShopping size={20} />
                {cartItemsCount > 0 && (
                  <span className="absolute -right-2.5 -top-2.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brand-brown text-[9px] font-bold text-white shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {isLoggedIn ? (
                <div className="relative pl-2.5 border-l border-zinc-200">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 hover:text-brand-brown transition-colors focus:outline-none"
                    aria-label="Toggle profile menu"
                  >
                    {/* Circle Avatar Initials */}
                    <div className="flex size-8 items-center justify-center rounded-full bg-brand-brown text-xs font-black text-white shadow-sm hover:scale-105 transition-transform">
                      {user?.name ? (user.name.split(" ").length >= 2 ? (user.name.split(" ")[0][0] + user.name.split(" ")[1][0]).toUpperCase() : user.name[0].toUpperCase()) : "U"}
                    </div>
                    <span className="hidden md:inline text-xs font-bold text-zinc-600 hover:text-brand-brown transition-colors select-none">
                      Hi, {user?.name?.split(" ")[0] || "User"}
                    </span>
                  </button>

                  {/* Dropdown Menu Card */}
                  {isProfileDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[190]"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2.5 w-56 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-gray-900 z-[200] animate-slideDown">
                        <div className="border-b pb-3 mb-3 dark:border-zinc-800">
                          <p className="text-sm font-bold text-brand-dark dark:text-white truncate">{user?.name}</p>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">{user?.email}</p>
                          <span className="mt-1.5 inline-flex items-center rounded-full bg-brand-sand/50 px-2 py-0.5 text-[9px] font-bold capitalize text-brand-brown dark:bg-brand-brown/10 dark:text-brand-brown-light">
                            {user?.role || "Customer"}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs text-brand-dark dark:text-zinc-300">
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-[#FAF9F5] dark:hover:bg-gray-800 transition-colors font-bold"
                          >
                            <FiUser className="text-zinc-400" size={14} /> My Profile
                          </Link>
                          <Link
                            to="/profile"
                            state={{ activeTab: "orders" }}
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-[#FAF9F5] dark:hover:bg-gray-800 transition-colors font-bold"
                          >
                            <FiPackage className="text-zinc-400" size={14} /> My Orders
                          </Link>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              setIsCartOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-[#FAF9F5] dark:hover:bg-gray-800 transition-colors font-bold text-left"
                          >
                            <FiShoppingCart className="text-zinc-400" size={14} /> My Cart ({cartItemsCount})
                          </button>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              setIsWishlistOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-[#FAF9F5] dark:hover:bg-gray-800 transition-colors font-bold text-left"
                          >
                            <FaHeart className="text-zinc-400" size={14} /> My Wishlist ({wishlist.length})
                          </button>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-bold text-left border-t border-dashed dark:border-zinc-800 mt-2"
                          >
                            <FiLogOut size={14} /> Log Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="flex items-center gap-1.5 pl-2.5 border-l border-zinc-200 text-sm font-bold text-brand-brown hover:text-brand-brown-dark transition-colors"
                >
                  <FiUser size={18} />
                  <span className="hidden sm:inline">Sign/Login</span>
                </Link>
              )}
            </div>


            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-brand-dark hover:bg-zinc-200 transition-colors lg:hidden active:scale-95 duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>


        {isMobileMenuOpen && (
          <div className="fixed inset-x-0 top-[77px] bottom-0 bg-black/40 backdrop-blur-sm lg:hidden z-[190] animate-fadeIn">
            <div className="bg-white px-6 py-8 border-b border-zinc-100 space-y-6 shadow-xl animate-slideDown max-h-[85vh] overflow-y-auto">

              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 border border-zinc-200 relative">
                <FcSearch className="text-lg" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400 pr-6"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </form>


              <div className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavLink(item.section)}
                    className="w-full text-left py-2 border-b border-zinc-50 text-base font-bold text-brand-dark hover:text-brand-brown transition-colors"
                  >
                    {item.label}
                  </button>
                ))}

                {isLoggedIn ? (
                  <div className="space-y-3 py-2 border-b border-zinc-100">
                    <div className="flex items-center justify-between text-base font-bold text-brand-dark dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-full bg-brand-brown text-[10px] font-black text-white">
                          {user?.name ? (user.name.split(" ").length >= 2 ? (user.name.split(" ")[0][0] + user.name.split(" ")[1][0]).toUpperCase() : user.name[0].toUpperCase()) : "U"}
                        </div>
                        <span>Hi, {user?.name || "User"}</span>
                      </div>
                    </div>
                    <div className="pl-9 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block font-bold hover:text-brand-brown transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/profile"
                        state={{ activeTab: "orders" }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block font-bold hover:text-brand-brown transition-colors"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsCartOpen(true);
                        }}
                        className="block font-bold hover:text-brand-brown transition-colors text-left"
                      >
                        My Cart ({cartItemsCount})
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsWishlistOpen(true);
                        }}
                        className="block font-bold hover:text-brand-brown transition-colors text-left"
                      >
                        My Wishlist ({wishlist.length})
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block font-bold text-red-500 hover:text-red-700 transition-colors text-left pt-1"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    state={{ from: location }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-left py-2 border-b border-zinc-50 text-base font-bold text-brand-brown hover:text-brand-brown-dark transition-colors"
                  >
                    Sign/Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>


      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-[250] flex justify-end animate-fadeIn" onClick={() => setIsCartOpen(false)}>
          <div
            className="w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col p-6 relative transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4 mb-4 dark:border-gray-800">
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <FaCartShopping /> Shopping Cart
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-gray-800 rounded-full dark:text-white">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-10">
                  <FaCartShopping size={48} className="text-zinc-300 mb-4 animate-bounce" />
                  <p className="font-medium">Your cart is empty</p>
                  <p className="text-sm text-zinc-400 mt-1">Explore our trendy collection to add items!</p>
                </div>
              ) : (
                cart.map((item) => {
                  const imageSrc = item.images?.[0] || item.image || logo;
                  const itemId = item._id || item.id;
                  return (
                    <div key={itemId} className="flex gap-4 p-3 rounded-xl border border-zinc-100 dark:border-gray-800 bg-zinc-50/50 dark:bg-gray-900/50 items-center">
                      <img
                        src={imageSrc}
                        alt={item.title}
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate(`/product/${itemId}`);
                        }}
                        className="h-16 w-16 rounded-lg object-cover bg-white border dark:border-gray-800 cursor-pointer hover:opacity-85 transition-opacity"
                      />
                      <div className="flex-1 min-w-0">
                        <h4
                          onClick={() => {
                            setIsCartOpen(false);
                            navigate(`/product/${itemId}`);
                          }}
                          className="font-bold text-sm text-brand-dark dark:text-white truncate cursor-pointer hover:text-brand-brown transition-colors"
                        >
                          {item.title || item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {Number(item.discount || 0) > 0 ? (
                            <>
                              <span className="text-xs text-brand-brown font-bold">
                                ₹ {(item.price - (item.price * Number(item.discount || 0)) / 100).toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-zinc-400 line-through">
                                ₹ {item.price.toLocaleString("en-IN")}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-brand-brown font-bold">
                              ₹ {item.price.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateCartQuantity(itemId, item.quantity - 1)}
                            className="p-1 border rounded hover:bg-zinc-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="text-xs font-bold w-6 text-center dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(itemId, item.quantity + 1)}
                            className="p-1 border rounded hover:bg-zinc-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full"
                        aria-label="Remove item"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4 mt-4 dark:border-gray-800 space-y-4">
                <div className="flex justify-between font-bold text-lg dark:text-white">
                  <span>Subtotal:</span>
                  <span className="text-brand-brown">₹ {cartSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      setIsCartOpen(false);
                      Swal.fire({
                        title: "Login Required",
                        text: "You must be logged in to checkout and buy things.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#8B5A2B",
                        cancelButtonColor: "#6B7280",
                        confirmButtonText: "Log In",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          navigate("/login", { state: { from: location } });
                        }
                      });
                      return;
                    }
                    setIsCartOpen(false);
                    navigate("/checkout");
                  }}
                  className="w-full bg-brand-brown hover:bg-brand-brown-dark text-white py-3 rounded-xl font-bold transition shadow-md active:scale-95 duration-200"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isWishlistOpen && (
        <div className="fixed inset-0 bg-black/50 z-[250] flex justify-end animate-fadeIn" onClick={() => setIsWishlistOpen(false)}>
          <div
            className="w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col p-6 relative transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4 mb-4 dark:border-gray-800">
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <FaHeart className="text-red-500" /> Wishlist
              </h2>
              <button onClick={() => setIsWishlistOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-gray-800 rounded-full dark:text-white">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-10">
                  <FaHeart size={48} className="text-zinc-200 mb-4 animate-pulse" />
                  <p className="font-medium">Your wishlist is empty</p>
                  <p className="text-sm text-zinc-400 mt-1">Add items to keep track of what you love!</p>
                </div>
              ) : (
                wishlist.map((item) => {
                  const imageSrc = item.images?.[0] || item.image || logo;
                  const itemId = item._id || item.id;
                  return (
                    <div key={itemId} className="flex gap-4 p-3 rounded-xl border border-zinc-100 dark:border-gray-800 bg-zinc-50/50 dark:bg-gray-900/50 items-center">
                      <img
                        src={imageSrc}
                        alt={item.title}
                        onClick={() => {
                          setIsWishlistOpen(false);
                          navigate(`/product/${itemId}`);
                        }}
                        className="h-16 w-16 rounded-lg object-cover bg-white border dark:border-gray-800 cursor-pointer hover:opacity-85 transition-opacity"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <h4
                          onClick={() => {
                            setIsWishlistOpen(false);
                            navigate(`/product/${itemId}`);
                          }}
                          className="font-bold text-sm text-brand-dark dark:text-white truncate cursor-pointer hover:text-brand-brown transition-colors"
                        >
                          {item.title || item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {Number(item.discount || 0) > 0 ? (
                            <>
                              <span className="text-xs text-brand-brown font-bold">
                                ₹ {(item.price - (item.price * Number(item.discount || 0)) / 100).toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-zinc-400 line-through">
                                ₹ {item.price.toLocaleString("en-IN")}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-brand-brown font-bold">
                              ₹ {item.price.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            if (!isLoggedIn) {
                              setIsWishlistOpen(false);
                              Swal.fire({
                                title: "Login Required",
                                text: "You must be logged in to add items to your cart and buy things.",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#8B5A2B",
                                cancelButtonColor: "#6B7280",
                                confirmButtonText: "Log In",
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  navigate("/login", { state: { from: location } });
                                }
                              });
                              return;
                            }
                            addToCart(item, 1);
                            toggleWishlist(item);
                            setIsWishlistOpen(false);
                            setIsCartOpen(true);
                          }}
                          className="mt-2 text-xs bg-brand-brown hover:bg-brand-brown-dark text-white px-3 py-1.5 rounded-lg font-semibold transition"
                        >
                          Add to Cart
                        </button>
                      </div>
                      <button
                        onClick={() => toggleWishlist(item)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full"
                        aria-label="Remove item"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
