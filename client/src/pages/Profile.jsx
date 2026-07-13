import { useState, useContext, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { ShopContext } from "../context/ShopContext";
import { apiRequest } from "../services/api";
import Swal from "sweetalert2";
import { FiUser, FiMail, FiLock, FiCalendar, FiArrowLeft, FiHeart, FiShoppingCart, FiAward, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiCheck, FiInfo, FiMapPin } from "react-icons/fi";

export default function Profile() {
  const { isLoggedIn, user, updateCurrentUser } = useContext(AuthContext);
  const { cart, wishlist } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    if (!isLoggedIn) return;2
    setOrdersLoading(true);
    try {
      const data = await apiRequest("/orders/my-orders");
      setOrders(data);
      if (selectedOrder) {
        const updated = data.find((o) => o._id === selectedOrder._id);
        if (updated) {
          setSelectedOrder(updated);
        }
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadOrders();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      if (location.state.activeTab === "orders") {
        loadOrders();
      }
      // Clear navigation state to avoid locking the tab
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    });
  }, [isLoggedIn, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      Swal.fire({
        title: "Validation Error",
        text: "Name and Email are required.",
        icon: "warning",
        confirmButtonColor: "#8B5A2B",
      });
      return;
    }

    if (form.password) {
      if (form.password.length < 6) {
        Swal.fire({
          title: "Weak Password",
          text: "New Password must be at least 6 characters.",
          icon: "warning",
          confirmButtonColor: "#8B5A2B",
        });
        return;
      }
      if (form.password !== form.confirmPassword) {
        Swal.fire({
          title: "Passwords Mismatch",
          text: "Confirm password does not match new password.",
          icon: "warning",
          confirmButtonColor: "#8B5A2B",
        });
        return;
      }
    }

    setSaving(true);
    try {
      const updateData = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      };
      if (form.password) {
        updateData.password = form.password;
      }

      const res = await apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (res.success && res.user) {
        updateCurrentUser(res.user);
        Swal.fire({
          title: "Profile Updated!",
          text: "Your account details have been successfully updated.",
          icon: "success",
          confirmButtonColor: "#8B5A2B",
        });
        setForm((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
      } else {
        throw new Error(res.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Update Failed",
        text: err.message || "Something went wrong while saving settings.",
        icon: "error",
        confirmButtonColor: "#8B5A2B",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  // Generate clean name initials
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const userInitials = getInitials(user.name);
  const totalCartQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <main className="bg-[#FAF9F5] text-brand-dark min-h-screen pb-20 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      {/* Breadcrumbs */}
      <div className="border-b border-zinc-200 bg-white/50 px-5 py-4 dark:border-zinc-800 dark:bg-gray-900/50 md:px-10 lg:px-20">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
          <Link to="/" className="hover:text-brand-brown transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-bold text-brand-dark dark:text-white">My Profile</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-12 md:px-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-brand-brown hover:text-brand-brown-dark dark:text-brand-brown-light transition-colors group"
        >
          <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Back
        </button>

        <h1 className="text-3xl font-black tracking-tight mb-10 md:text-4xl">Account Settings</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-start">
          {/* Left Column: User Summary Card & Stats */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-gray-900">
              {/* Initials Avatar */}
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-brand-brown to-brand-brown-dark text-3xl font-black text-white shadow-md">
                {userInitials}
              </div>
              <h2 className="text-xl font-bold dark:text-white">{user.name}</h2>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">{user.email}</p>

              {/* Role badge */}
              <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#F4F2EB] px-3 py-1 text-xs font-bold capitalize text-brand-brown dark:bg-brand-brown/20 dark:text-brand-brown-light">
                <FiAward size={12} /> {user.role === "admin" ? "Administrator" : "Customer"}
              </span>

              {/* Date registered (mocked/static fallback) */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 border-t pt-5 dark:border-zinc-800">
                <FiCalendar />
                <span>Member since June 2026</span>
              </div>
            </div>

            {/* Profile Navigation List */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-gray-900 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("details");
                  setSelectedOrder(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "details"
                    ? "bg-brand-brown text-white shadow-md dark:bg-brand-brown dark:text-white"
                    : "text-zinc-650 hover:bg-[#FAF9F5] dark:text-zinc-300 dark:hover:bg-gray-800"
                }`}
              >
                <FiUser size={16} />
                Personal Details
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("orders");
                  loadOrders();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "orders"
                    ? "bg-brand-brown text-white shadow-md dark:bg-brand-brown dark:text-white"
                    : "text-zinc-650 hover:bg-[#FAF9F5] dark:text-zinc-300 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiPackage size={16} />
                  My Orders
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === "orders"
                    ? "bg-white text-brand-brown"
                    : "bg-[#F4F2EB] text-brand-brown dark:bg-zinc-800 dark:text-brand-brown-light"
                }`}>
                  {orders.length}
                </span>
              </button>

              {user.role === "admin" ? (
                <button
                  type="button"
                  onClick={() => navigate("/admin/dashboard")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-brand-brown border border-brand-brown hover:bg-brand-brown hover:text-white transition-all mt-2"
                >
                  <FiLock size={16} />
                  Go to Admin Panel
                </button>
              ) : (
                <Link
                  to="/admin-login"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs text-zinc-400 hover:text-brand-brown border border-dashed border-zinc-200 hover:border-brand-brown transition-all mt-2 text-center"
                >
                  <FiLock size={13} />
                  Admin Portal Login
                </Link>
              )}
            </div>


            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-gray-900 flex flex-col items-center justify-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#FAF9F5] text-brand-brown dark:bg-zinc-850 dark:text-brand-brown-light mb-3">
                  <FiShoppingCart size={18} />
                </div>
                <span className="text-2xl font-black">{totalCartQty}</span>
                <span className="text-xs text-zinc-400 font-bold mt-1">Items in Cart</span>
              </div>

              <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-gray-900 flex flex-col items-center justify-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#FAF9F5] text-brand-brown dark:bg-zinc-850 dark:text-brand-brown-light mb-3">
                  <FiHeart size={18} />
                </div>
                <span className="text-2xl font-black">{wishlist.length}</span>
                <span className="text-xs text-zinc-400 font-bold mt-1">Wishlist Saves</span>
              </div>
            </div>
          </div>

          {/* Right Column: Account Details Settings Form / Orders List & Tracker */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-gray-900">
            {activeTab === "details" ? (
              <div>
                <h3 className="text-lg font-bold mb-6 border-b pb-3 dark:border-zinc-850">Personal Details</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                      <FiUser /> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-zinc-200 bg-[#FAF9F5] px-4 py-3 text-sm focus:border-brand-brown focus:ring-2 focus:ring-brand-brown outline-none transition-all dark:border-zinc-800 dark:bg-gray-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                      <FiMail /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="example@gmail.com"
                      className="w-full rounded-xl border border-zinc-200 bg-[#FAF9F5] px-4 py-3 text-sm focus:border-brand-brown focus:ring-2 focus:ring-brand-brown outline-none transition-all dark:border-zinc-800 dark:bg-gray-950 dark:text-white"
                    />
                  </div>

                  <div className="pt-4 border-t border-dashed dark:border-zinc-850 space-y-6">
                    <h4 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Change Password (Optional)</h4>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                          <FiLock /> New Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Minimum 6 characters"
                          className="w-full rounded-xl border border-zinc-200 bg-[#FAF9F5] px-4 py-3 text-sm focus:border-brand-brown focus:ring-2 focus:ring-brand-brown outline-none transition-all dark:border-zinc-800 dark:bg-gray-950 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                          <FiLock /> Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repeat new password"
                          className="w-full rounded-xl border border-zinc-200 bg-[#FAF9F5] px-4 py-3 text-sm focus:border-brand-brown focus:ring-2 focus:ring-brand-brown outline-none transition-all dark:border-zinc-800 dark:bg-gray-950 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t dark:border-zinc-800 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-brand-brown px-8 py-3.5 font-bold text-white hover:bg-brand-brown-dark transition-colors shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {saving ? "Saving Changes..." : "Save Profile Settings"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                {selectedOrder ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(null)}
                        className="inline-flex items-center gap-2 text-sm font-bold text-brand-brown hover:text-brand-brown-dark dark:text-brand-brown-light transition-colors group"
                      >
                        <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Back to My Orders
                      </button>
                      <button
                        type="button"
                        onClick={loadOrders}
                        className="text-xs font-bold text-brand-brown hover:text-brand-brown-dark hover:underline dark:text-brand-brown-light"
                      >
                        Refresh Status
                      </button>
                    </div>

                    <div className="border-b pb-4 mb-6 dark:border-zinc-800">
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                          <h4 className="text-lg font-black tracking-tight dark:text-white">Order Details</h4>
                          <p className="text-xs text-zinc-400 mt-1">Order ID: <span className="font-mono text-zinc-500 font-bold select-all">{selectedOrder._id}</span></p>
                          <p className="text-xs text-zinc-400 mt-0.5">Placed on: {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                            selectedOrder.orderStatus === "Delivered"
                              ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                              : selectedOrder.orderStatus === "Cancelled"
                              ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                          }`}>
                            {selectedOrder.orderStatus}
                          </span>
                          <p className="text-sm font-black text-brand-brown dark:text-brand-brown-light mt-1.5 font-sans">Total: ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mb-8">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Items Purchased</h5>
                      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border rounded-xl p-4 bg-zinc-50/30 dark:bg-zinc-950/10 dark:border-zinc-800">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={item._id || idx} className={`flex gap-4 items-center ${idx > 0 ? "pt-4 mt-4" : ""}`}>
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-16 w-16 rounded-lg object-cover bg-white border dark:border-zinc-800"
                            />
                            <div className="flex-1 min-w-0">
                              <h6 className="font-bold text-sm text-brand-dark dark:text-white truncate">{item.title}</h6>
                              <p className="text-xs text-zinc-400 mt-1">Quantity: {item.quantity} | Price: ₹{item.price.toLocaleString("en-IN")}</p>
                              {item.discount > 0 && <span className="text-[10px] text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 px-1.5 py-0.5 rounded font-bold">{item.discount}% Off</span>}
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-brand-dark dark:text-white">₹{((item.price - (item.price * (item.discount || 0)) / 100) * item.quantity).toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Visual Tracking Stepper */}
                    <div className="mb-8 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800 bg-[#FAF9F5]/40 dark:bg-zinc-900/40">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-1.5"><FiMapPin /> Delivery Tracking</h5>

                      {selectedOrder.orderStatus === "Cancelled" ? (
                        <div className="flex items-start gap-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 shadow">
                            <FiXCircle size={18} />
                          </div>
                          <div>
                            <h6 className="font-bold text-sm text-red-600 dark:text-red-400">Order Cancelled</h6>
                            <p className="text-xs text-zinc-400 mt-1">Your order was cancelled. {selectedOrder.trackingHistory.find(h => h.status === "Cancelled")?.message || ""}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-2 relative">
                          {[
                            { name: "Ordered", label: "Ordered" },
                            { name: "Packed", label: "Packed" },
                            { name: "Shipped", label: "Shipped" },
                            { name: "Out for Delivery", label: "Out for Delivery" },
                            { name: "Delivered", label: "Delivered" },
                          ].map((step, index) => {
                            const stepsMap = ["Ordered", "Packed", "Shipped", "Out for Delivery", "Delivered"];
                            const currentStatusIndex = stepsMap.indexOf(selectedOrder.orderStatus);
                            const stepIndex = stepsMap.indexOf(step.name);
                            const isCompleted = stepIndex <= currentStatusIndex;
                            const isActive = stepIndex === currentStatusIndex;
                            const stepDate = selectedOrder.trackingHistory.find(h => h.status === step.name);

                            return (
                              <div key={step.name} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 relative z-10">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                                  isCompleted
                                    ? "bg-green-600 text-white shadow dark:bg-green-500"
                                    : "bg-zinc-200 text-zinc-400 dark:bg-zinc-850 dark:text-zinc-650"
                                } ${isActive ? "ring-4 ring-green-100 dark:ring-green-950 animate-pulse" : ""}`}>
                                  {isCompleted ? <FiCheck size={16} /> : <span className="text-xs font-bold">{index + 1}</span>}
                                </div>

                                <div className="text-left md:text-center">
                                  <p className={`text-xs font-bold ${isCompleted ? "text-green-600 dark:text-green-400" : "text-zinc-400"}`}>{step.label}</p>
                                  {stepDate && (
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">
                                      {new Date(stepDate.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                    </p>
                                  )}
                                </div>

                                {index < 4 && (
                                  <div className={`hidden md:block absolute top-4 left-[calc(50%+16px)] right-[-50%] h-[3px] -z-10 transition-colors duration-300 ${
                                    stepIndex < currentStatusIndex ? "bg-green-600 dark:bg-green-500" : "bg-zinc-200 dark:bg-zinc-800"
                                  }`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Detailed History */}
                    <div className="mb-8 border rounded-xl p-5 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Detailed Status History</h5>

                      <div className="relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-6">
                        {selectedOrder.trackingHistory.slice().reverse().map((log, idx) => (
                          <div key={log._id || idx} className="relative">
                            <div className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-zinc-200 dark:border-zinc-900 dark:bg-zinc-800">
                              <div className={`h-1.5 w-1.5 rounded-full ${idx === 0 ? "bg-brand-brown dark:bg-brand-brown-light" : "bg-zinc-400"}`} />
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${idx === 0 ? "text-brand-dark dark:text-white" : "text-zinc-500"}`}>
                                  {log.status}
                                </span>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">
                                  {new Date(log.timestamp).toLocaleString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{log.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address & Payment Info */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="border border-zinc-200 rounded-xl p-5 dark:border-zinc-800 bg-[#FAF9F5]/20 dark:bg-zinc-900/10">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5"><FiMapPin /> Delivery Address</h5>
                        <p className="text-sm font-bold dark:text-white">{selectedOrder.shippingAddress.name}</p>
                        <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1.5 leading-relaxed">{selectedOrder.shippingAddress.address}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zip}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-semibold">Phone: {selectedOrder.shippingAddress.phone}</p>
                      </div>

                      <div className="border border-zinc-200 rounded-xl p-5 dark:border-zinc-800 bg-[#FAF9F5]/20 dark:bg-zinc-900/10">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5"><FiInfo /> Payment Information</h5>
                        <p className="text-sm font-bold dark:text-white uppercase">Method: {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery (COD)" : selectedOrder.paymentMethod}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-zinc-400">Payment Status:</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            selectedOrder.paymentStatus === "paid"
                              ? "bg-green-150 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                              : "bg-yellow-150 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-450"
                          }`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </div>
                        {selectedOrder.paymentDetails?.razorpay_payment_id && (
                          <div className="mt-3 text-[10px] font-mono text-zinc-400 space-y-1">
                            <p>Payment ID: {selectedOrder.paymentDetails.razorpay_payment_id}</p>
                            <p>Order ID: {selectedOrder.paymentDetails.razorpay_order_id}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-lg font-black tracking-tight dark:text-white">Order History</h4>
                      <button
                        type="button"
                        onClick={loadOrders}
                        className="text-xs font-bold text-brand-brown hover:text-brand-brown-dark hover:underline dark:text-brand-brown-light"
                      >
                        Refresh List
                      </button>
                    </div>

                    {ordersLoading ? (
                      <div className="py-20 text-center text-zinc-450 dark:text-zinc-550">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-brown mx-auto mb-4" />
                        Loading orders...
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="py-16 text-center border border-dashed rounded-2xl dark:border-zinc-800">
                        <FiPackage size={48} className="text-zinc-300 mx-auto mb-4" />
                        <p className="font-bold text-zinc-500">No Orders Placed Yet</p>
                        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">Explore our catalog and place your first order to start tracking!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => {
                          const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          });

                          return (
                            <div
                              key={order._id}
                              className="border border-zinc-150 rounded-xl p-4 hover:border-brand-brown dark:border-zinc-800 dark:hover:border-brand-brown-light transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                            >
                              <div className="flex items-center gap-4 min-w-0 flex-1">
                                <div className="flex -space-x-4 overflow-hidden py-1">
                                  {order.items.slice(0, 3).map((item, idx) => (
                                    <img
                                      key={item._id || idx}
                                      src={item.image}
                                      alt={item.title}
                                      className="inline-block h-12 w-12 rounded-lg border-2 border-white bg-zinc-100 object-cover dark:border-gray-900 shadow-sm"
                                    />
                                  ))}
                                  {order.items.length > 3 && (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-zinc-150 text-xs font-bold text-zinc-500 dark:border-gray-900 dark:bg-zinc-850">
                                      +{order.items.length - 3}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-mono text-zinc-400 select-all truncate">ID: {order._id}</p>
                                  <h6 className="font-bold text-sm text-brand-dark dark:text-white mt-1 truncate">
                                    {order.items.map((i) => i.title).join(", ")}
                                  </h6>
                                  <p className="text-xs text-zinc-400 mt-0.5">Ordered: {dateStr} | Total: ₹{order.totalAmount.toLocaleString("en-IN")}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                  order.orderStatus === "Delivered"
                                    ? "bg-green-100 text-green-700 dark:bg-green-955/20 dark:text-green-400"
                                    : order.orderStatus === "Cancelled"
                                    ? "bg-red-100 text-red-700 dark:bg-red-955/20 dark:text-red-400"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-955/20 dark:text-blue-400"
                                }`}>
                                  {order.orderStatus}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-xs bg-brand-brown hover:bg-brand-brown-dark text-white font-bold px-4 py-2 rounded-lg transition"
                                >
                                  Track Status
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  </main>
  );
}
