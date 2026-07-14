import { useContext, useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { apiRequest } from "../services/api";
import logo from "../assets/furnicraftlogo.png";
import {
  FiGrid,
  FiPackage,
  FiLogOut,
  FiBell,
  FiSettings,
  FiMoon,
  FiSun,
  FiFolder,
  FiFileText,
  FiMessageSquare,
  FiTrendingUp,
  FiUsers,
  FiShoppingBag,
  FiMenu,
  FiX,
} from "react-icons/fi";

function AdminLayout() {
  const { adminLogout, adminUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [notifications, setNotifications] = useState([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await apiRequest("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.length;

  const handleNotificationClick = async (id, link) => {
    try {
      await apiRequest(`/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (link) {
        navigate(link);
      }
    } catch (err) {
      console.error("Failed to clear notification:", err);
    }
  };

  const getRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/admin-login", { replace: true });
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
      ? "bg-indigo-600 text-white shadow-lg"
      : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <div className="h-screen overflow-hidden bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-40 flex items-center justify-between lg:justify-end px-4 md:px-8">
        
        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-600 transition-all focus:outline-none"
          >
            <FiMenu size={24} />
          </button>
          <span className="font-bold text-gray-850 dark:text-white text-sm">FurniCraft Admin</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-600 transition-all"
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-600 transition-all focus:outline-none"
            >
              <FiBell size={20} />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-semibold bg-red-500 text-white rounded-full animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotifDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50 max-h-96 flex flex-col">
                  <div className="flex items-center justify-between border-b pb-2 mb-2 dark:border-gray-800">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
                  </div>
                  <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-800">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => {
                            handleNotificationClick(notif._id, notif.link);
                            setIsNotifDropdownOpen(false);
                          }}
                          className="py-2.5 px-2 rounded-xl cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 flex flex-col gap-0.5 mt-1 bg-indigo-50/10 dark:bg-indigo-950/5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold leading-tight text-gray-900 dark:text-white">
                              {notif.title}
                            </span>
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                              {getRelativeTime(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-600 transition-all">
            <FiSettings size={20} />
          </button>

          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-1 md:mx-2" />

          <div className="text-right hidden sm:block">
            <p className="font-medium text-gray-800 dark:text-white text-sm">
              {adminUser?.name || "Admin"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Administrator
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
            {adminUser?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
        </div>
      </header>

      {/* Sidebar Drawer */}
      <aside className={`fixed top-0 left-0 w-72 h-screen bg-gray-900 dark:bg-black text-white flex flex-col justify-between border-r border-gray-800 z-50 transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-900 dark:bg-black">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white shadow-md">
                <img
                  src={logo}
                  alt="FurniCraft"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl font-bold text-white">FurniCraft</span>
            </div>
            
            {/* Sidebar close button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all focus:outline-none"
            >
              <FiX size={22} />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            <NavLink to="/admin/dashboard" className={navClass} onClick={() => setIsSidebarOpen(false)}>
              <FiGrid size={18} />
              Dashboard
            </NavLink>

            <NavLink to="/admin/categories" className={navClass} onClick={() => setIsSidebarOpen(false)}>
              <FiFolder size={18} />
              Category
            </NavLink>

            <NavLink to="/admin/products" className={navClass} onClick={() => setIsSidebarOpen(false)}>
              <FiPackage size={18} />
              Products
            </NavLink>

            <NavLink to="/admin/orders" className={navClass} onClick={() => setIsSidebarOpen(false)}>
              <FiShoppingBag size={18} />
              Orders
            </NavLink>

            <NavLink to="/admin/blogs" className={navClass} onClick={() => setIsSidebarOpen(false)}>
              <FiFileText size={18} />
              Blogs
            </NavLink>

            <NavLink to="/admin/testimonials" className={navClass} onClick={() => setIsSidebarOpen(false)}>
              <FiMessageSquare size={18} />
              Testimonials
            </NavLink>

            <NavLink to="/admin/best-sellers" className={navClass} onClick={() => setIsSidebarOpen(false)}>
              <FiTrendingUp size={18} />
              Best Sellers
            </NavLink>

            <NavLink to="/admin/users" className={navClass} onClick={() => setIsSidebarOpen(false)}>
              <FiUsers size={18} />
              Users
            </NavLink>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
              setIsSidebarOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-3 rounded-xl transition-colors"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-0 lg:ml-72 pt-16 h-screen overflow-y-auto">
        <div className="p-4 md:p-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-gray-900/40 p-4 md:p-6 min-h-[calc(100vh-8rem)] transition-colors duration-300">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
