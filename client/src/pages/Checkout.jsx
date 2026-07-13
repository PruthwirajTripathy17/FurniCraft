import { useState, useContext, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { AuthContext } from "../context/auth-context";
import { FiArrowLeft, FiShoppingBag, FiTruck, FiCreditCard } from "react-icons/fi";
import logo from "../assets/furnicraftlogo.png";
import Swal from "sweetalert2";
import { apiRequest } from "../services/api";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { cart, clearCart, setIsCartOpen } = useContext(ShopContext);
  const { isLoggedIn, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    state: "",
  });

  const [payment, setPayment] = useState("cod");

  useEffect(() => {
    // If not logged in, redirect to login page
    if (!isLoggedIn) {
      Swal.fire({
        title: "Login Required",
        text: "You must be logged in to view checkout details and place orders.",
        icon: "warning",
        confirmButtonColor: "#8B5A2B",
        confirmButtonText: "Log In",
      }).then(() => {
        navigate("/login", { state: { from: { pathname: "/checkout" } } });
      });
    }
    // Close the cart drawer when accessing checkout page
    setIsCartOpen(false);
  }, [isLoggedIn]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const singleProduct = location.state?.singleProduct;
  const singleQuantity = location.state?.quantity || 1;
  const checkoutItems = singleProduct
    ? [{ ...singleProduct, quantity: singleQuantity }]
    : cart;

  const cartSubtotal = checkoutItems.reduce((acc, item) => {
    const discount = Number(item.discount || 0);
    const itemPrice = discount > 0 ? item.price - (item.price * discount) / 100 : item.price;
    return acc + itemPrice * item.quantity;
  }, 0);
  const shippingCharge = cartSubtotal > 5000 ? 0 : 499;
  const estimatedTax = Math.round(cartSubtotal * 0.18); // 18% GST
  const grandTotal = cartSubtotal + shippingCharge + estimatedTax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim() || !form.zip.trim() || !form.state.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Please fill in all shipping details.",
        icon: "error",
        confirmButtonColor: "#8B5A2B",
      });
      return;
    }

    // Phone number validation: must be exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      Swal.fire({
        title: "Invalid Phone Number!",
        text: "Phone number must be exactly 10 digits (digits only).",
        icon: "warning",
        confirmButtonColor: "#8B5A2B",
      });
      return;
    }

    // PIN code validation: must be exactly 6 digits
    const zipRegex = /^\d{6}$/;
    if (!zipRegex.test(form.zip.trim())) {
      Swal.fire({
        title: "Invalid PIN Code!",
        text: "PIN/Postal code must be exactly 6 digits (digits only).",
        icon: "warning",
        confirmButtonColor: "#8B5A2B",
      });
      return;
    }

    const items = checkoutItems.map((item) => ({
      product: item._id || item.id,
      title: item.title || item.name,
      price: item.price,
      discount: Number(item.discount || 0),
      quantity: item.quantity,
      image: item.images?.[0] || item.image || "",
    }));

    const shippingAddress = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zip: form.zip.trim(),
    };

    // Cash on Delivery flow (standard direct submission)
    if (payment === "cod") {
      try {
        await apiRequest("/orders", {
          method: "POST",
          body: JSON.stringify({
            items,
            shippingAddress,
            paymentMethod: "cod",
            paymentStatus: "pending",
            totalAmount: grandTotal,
          }),
        });

        Swal.fire({
          title: "Order Confirmed!",
          text: `Thank you for shopping, ${form.name}! Your Cash on Delivery order has been placed successfully and will be delivered within 3-5 business days.`,
          icon: "success",
          confirmButtonColor: "#8B5A2B",
          confirmButtonText: "View My Orders",
        }).then(() => {
          if (!singleProduct) {
            clearCart();
          }
          navigate("/profile");
        });
      } catch (err) {
        console.error("Order creation error", err);
        Swal.fire({
          title: "Order Placement Failed!",
          text: err.message || "Failed to place your order. Please try again.",
          icon: "error",
          confirmButtonColor: "#8B5A2B",
        });
      }
      return;
    }

    // Online Payments via Razorpay (UPI or card)
    try {
      // 1. Create order on the backend
      const orderRes = await apiRequest("/payment/order", {
        method: "POST",
        body: JSON.stringify({ amount: grandTotal }),
      });

      if (!orderRes || !orderRes.orderId) {
        throw new Error("Failed to receive valid Razorpay order details from the server.");
      }

      // 2. Load the Razorpay Checkout script dynamically
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        Swal.fire({
          title: "Error!",
          text: "Failed to load Razorpay Payment Gateway SDK. Please check your network connection.",
          icon: "error",
          confirmButtonColor: "#8B5A2B",
        });
        return;
      }

      // 3. Open Razorpay payment modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "FurniCraft",
        description: `Order payment for ${checkoutItems.length} item(s)`,
        image: logo,
        order_id: orderRes.orderId,
        handler: async function (response) {
          try {
            // Verify payment signature on the backend
            const verifyRes = await apiRequest("/payment/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.success) {
              // Create the database order
              await apiRequest("/orders", {
                method: "POST",
                body: JSON.stringify({
                  items,
                  shippingAddress,
                  paymentMethod: payment,
                  paymentStatus: "paid",
                  paymentDetails: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  },
                  totalAmount: grandTotal,
                }),
              });

              Swal.fire({
                title: "Payment Successful!",
                text: `Thank you for shopping, ${form.name}! Your payment was verified and order has been placed successfully.`,
                icon: "success",
                confirmButtonColor: "#8B5A2B",
                confirmButtonText: "View My Orders",
              }).then(() => {
                if (!singleProduct) {
                  clearCart();
                }
                navigate("/profile");
              });
            } else {
              throw new Error(verifyRes.error || "Signature verification failed");
            }
          } catch (verifyErr) {
            console.error("Verification verification error", verifyErr);
            Swal.fire({
              title: "Payment Error!",
              text: `Payment succeeded but verification failed: ${verifyErr.message || "Invalid signature"}. Please contact support.`,
              icon: "error",
              confirmButtonColor: "#8B5A2B",
            });
          }
        },
        prefill: {
          name: form.name,
          contact: form.phone,
          email: user?.email || "",
        },
        theme: {
          color: "#8B5A2B",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        Swal.fire({
          title: "Payment Failed",
          text: response.error.description || "The payment transaction could not be completed.",
          icon: "error",
          confirmButtonColor: "#8B5A2B",
        });
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay payment init error", err);
      Swal.fire({
        title: "Payment Error!",
        text: err.message || "Failed to initialize payment gateway. Please try again.",
        icon: "error",
        confirmButtonColor: "#8B5A2B",
      });
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <main className="bg-[#FAF9F5] text-brand-dark min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <FiShoppingBag size={64} className="text-zinc-300 mb-4" />
        <h2 className="text-2xl font-black mb-2">Your Cart is Empty</h2>
        <p className="text-zinc-500 mb-8 max-w-sm">
          There are no products in your checkout summary. Add items to your cart to checkout.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-full bg-brand-brown px-8 py-3.5 font-bold text-white hover:bg-brand-brown-dark transition-colors shadow-md"
        >
          Explore Collection
        </button>
      </main>
    );
  }

  return (
    <main className="bg-[#FAF9F5] text-brand-dark transition-colors duration-300 dark:bg-gray-950 dark:text-white min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="border-b border-zinc-200 bg-white/50 px-5 py-4 dark:border-zinc-800 dark:bg-gray-900/50 md:px-10 lg:px-20">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
          <Link to="/" className="hover:text-brand-brown transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-bold text-brand-dark dark:text-white">Checkout</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-10 lg:px-20">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-brand-brown hover:text-brand-brown-dark dark:text-brand-brown-light transition-colors group"
        >
          <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Continue Shopping
        </button>

        <h1 className="text-3xl font-black tracking-tight mb-10 md:text-4xl">Order Checkout</h1>

        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          {/* Shipping Form & Payment Panel */}
          <form onSubmit={handlePlaceOrder} className="space-y-8">
            {/* Delivery address */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-gray-900">
              <h2 className="text-xl font-bold flex items-center gap-2.5 mb-6 text-brand-brown dark:text-brand-brown-light">
                <FiTruck size={20} /> 1. Shipping Details
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-zinc-200 bg-[#FAF9F5] px-4 py-3 text-sm focus:border-brand-brown focus:ring-2 focus:ring-brand-brown outline-none transition-all dark:border-zinc-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    required
                    maxLength="10"
                    pattern="\d{10}"
                    title="Phone number must be exactly 10 digits (digits only)"
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-zinc-200 bg-[#FAF9F5] px-4 py-3 text-sm focus:border-brand-brown focus:ring-2 focus:ring-brand-brown outline-none transition-all dark:border-zinc-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    required
                    placeholder="House, building details, area name, street"
                    className="w-full rounded-xl border border-zinc-200 bg-[#FAF9F5] px-4 py-3 text-sm focus:border-brand-brown focus:ring-2 focus:ring-brand-brown outline-none transition-all dark:border-zinc-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    required
                    placeholder="City name"
                    className="w-full rounded-xl border border-zinc-200 bg-[#FAF9F5] px-4 py-3 text-sm focus:border-brand-brown focus:ring-2 focus:ring-brand-brown outline-none transition-all dark:border-zinc-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Postal Code (PIN)</label>
                  <input
                    type="text"
                    name="zip"
                    value={form.zip}
                    onChange={handleInputChange}
                    required
                    maxLength="6"
                    pattern="\d{6}"
                    title="PIN code must be exactly 6 digits (digits only)"
                    placeholder="6-digit ZIP code"
                    className="w-full rounded-xl border border-zinc-200 bg-[#FAF9F5] px-4 py-3 text-sm focus:border-brand-brown focus:ring-2 focus:ring-brand-brown outline-none transition-all dark:border-zinc-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleInputChange}
                    required
                    placeholder="State name"
                    className="w-full rounded-xl border border-zinc-200 bg-[#FAF9F5] px-4 py-3 text-sm focus:border-brand-brown focus:ring-2 focus:ring-brand-brown outline-none transition-all dark:border-zinc-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-gray-900">
              <h2 className="text-xl font-bold flex items-center gap-2.5 mb-6 text-brand-brown dark:text-brand-brown-light">
                <FiCreditCard size={20} /> 2. Payment Method
              </h2>
              <div className="space-y-4">
                {[
                  { id: "cod", label: "Cash on Delivery (COD)", desc: "Pay with cash at your doorstep during delivery" },
                  { id: "upi", label: "UPI (Google Pay / PhonePe / Paytm)", desc: "Instant online transfer via secure gateway code" },
                  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay cards supported" },
                ].map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      payment === option.id
                        ? "border-brand-brown bg-[#FBF9F4] dark:border-brand-brown-light dark:bg-gray-950/40"
                        : "border-zinc-100 hover:border-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === option.id}
                      onChange={() => setPayment(option.id)}
                      className="mt-1 accent-brand-brown"
                    />
                    <div>
                      <span className="font-bold text-sm block">{option.label}</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 block">{option.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-brown hover:bg-brand-brown-dark text-white py-4 rounded-full font-bold text-base transition shadow-md active:scale-98 tracking-wide uppercase"
            >
              Place Order & Pay
            </button>
          </form>

          {/* Order Summary & Descriptions */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-gray-900">
              <h2 className="text-xl font-bold mb-6 text-brand-brown dark:text-brand-brown-light">Order Summary</h2>

              {/* Items List */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 space-y-4 max-h-[380px] overflow-y-auto pr-2 mb-6">
                {checkoutItems.map((item, idx) => {
                  const imageSrc = item.images?.[0] || item.image || logo;
                  const itemId = item._id || item.id;
                  const itemDesc = item.description || "Expertly crafted with refined aesthetics, this premium furniture piece brings both luxury and functionality to your modern living space.";
                  return (
                    <div key={itemId} className={`flex gap-4 items-start ${idx > 0 ? "pt-4" : ""}`}>
                      <img
                        src={imageSrc}
                        alt={item.title}
                        className="h-16 w-16 rounded-lg object-cover bg-zinc-50 border dark:border-gray-800"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-brand-dark dark:text-white truncate">
                          {item.title || item.name}
                        </h4>
                        <p className="text-xs text-zinc-400 capitalize mt-0.5">{item.category || "Furniture"}</p>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed italic">
                          {itemDesc}
                        </p>
                        <div className="flex items-center justify-between gap-4 mt-2">
                          <span className="text-xs font-bold text-zinc-500">Qty: {item.quantity}</span>
                          <div className="flex flex-col items-end">
                            {Number(item.discount || 0) > 0 ? (
                              <>
                                <span className="text-sm text-brand-brown font-bold">
                                  ₹ {((item.price - (item.price * Number(item.discount || 0)) / 100) * item.quantity).toLocaleString("en-IN")}
                                </span>
                                <span className="text-[10px] text-zinc-400 line-through">
                                  ₹ {(item.price * item.quantity).toLocaleString("en-IN")}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-brand-brown font-bold">
                                ₹ {(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-sm font-medium">
                <div className="flex justify-between text-zinc-500">
                  <span>Price ({checkoutItems.length} item{checkoutItems.length > 1 ? "s" : ""})</span>
                  <span>₹ {cartSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Delivery Charges</span>
                  <span>{shippingCharge === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹ ${shippingCharge}`}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Estimated GST (18%)</span>
                  <span>₹ {estimatedTax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-black text-lg border-t border-dashed pt-4 dark:border-zinc-800">
                  <span>Total Amount</span>
                  <span className="text-brand-brown dark:text-brand-brown-light">₹ {grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
