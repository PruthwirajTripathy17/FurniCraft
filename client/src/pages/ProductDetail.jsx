import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { AuthContext } from "../context/auth-context";
import { apiRequest } from "../services/api";
import Swal from "sweetalert2";
import ProductCard from "../components/ProductCard";
import Stars from "../components/Stars";
import {
  FiArrowLeft,
  FiShoppingCart,
  FiHeart,
  FiShield,
  FiTruck,
  FiRotateCcw,
  FiMinus,
  FiPlus,
  FiCheck,
  FiStar,
} from "react-icons/fi";

const defaultImage =
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80";

const defaultDescription =
  "Expertly crafted with refined aesthetics, this premium furniture piece brings both luxury and functionality to your modern living space. Built from high-quality, sustainably sourced materials, it features robust durability, ergonomic comfort, and a timeless design that complements any contemporary decor layout.";

const specifications = [
  {
    label: "Material",
    value: "Premium Solid Oak Wood & High-Density Foam Upholstery",
  },
  { label: "Dimensions", value: "85cm H x 210cm W x 95cm D" },
  { label: "Assembly", value: "Fully Assembled on Delivery" },
  { label: "Warranty", value: "2 Years Limited Manufacturer Warranty" },
  {
    label: "Care",
    value: "Wipe clean with a dry or slightly damp lint-free cloth",
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useContext(AuthContext);
  const { cart, addToCart, toggleWishlist, isInWishlist, setIsCartOpen } = useContext(ShopContext);
  const isProductInCart = cart.some((item) => (item._id || item.id) === id);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState("");

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);


  useEffect(() => {
    if (product) {
      setActiveImage(product.images?.[0] || product.image || defaultImage);
    }
  }, [product]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const productData = await apiRequest(`/products/${id}`);
        setProduct(productData);

        const allProducts = await apiRequest("/products");
        const filtered = allProducts.filter(
          (p) =>
            p.category === productData.category &&
            (p._id || p.id) !== productData._id &&
            (p._id || p.id) !== productData.id,
        );
        setRelatedProducts(filtered.slice(0, 4));
      } catch (err) {
        console.error(err);
        setError("Product not found or failed to load. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-4 py-20 dark:bg-gray-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-brand-brown"></div>
        <p className="text-zinc-500 dark:text-zinc-400">
          Loading exquisite details...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h2 className="mb-4 text-2xl font-black text-brand-dark dark:text-white">
          Product Not Found
        </h2>
        <p className="mb-8 text-zinc-500 dark:text-zinc-400">
          {error || "The product you're looking for does not exist."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-full bg-brand-brown px-6 py-3 font-bold text-white hover:bg-brand-brown-dark transition-colors"
        >
          <FiArrowLeft /> Back to Shop
        </button>
      </div>
    );
  }

  const imageSrc = product.images?.[0] || product.image || defaultImage;
  const title = product.title || "Furniture Item";
  const price = product.price || 0;
  const discount = Number(product.discount || 0);
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount
    ? price - (price * discount) / 100
    : price;

  const handleAddToCart = () => {
    if (!isLoggedIn) {
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
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      Swal.fire({
        title: "Login Required",
        text: "You must be logged in to buy things.",
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
    navigate("/checkout", { state: { singleProduct: product, quantity } });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      Swal.fire({
        title: "Error",
        text: "Please enter a comment.",
        icon: "error",
        confirmButtonColor: "#8B5A2B",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await apiRequest(`/products/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      });

      setProduct((prev) => ({
        ...prev,
        reviews: res.reviews,
        rating: res.rating,
        numReviews: res.numReviews,
      }));

      setComment("");
      setRating(5);

      Swal.fire({
        title: "Success",
        text: "Review submitted successfully!",
        icon: "success",
        confirmButtonColor: "#8B5A2B",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Failed to submit review",
        text: err.message || "Something went wrong.",
        icon: "error",
        confirmButtonColor: "#8B5A2B",
      });
    } finally {
      setSubmittingReview(false);
    }
  };


  return (
    <main className="bg-[#FAF9F5] text-brand-dark transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      <div className="border-b border-zinc-200 bg-white/50 px-5 py-4 dark:border-zinc-800 dark:bg-gray-900/50 md:px-10 lg:px-20">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
          <Link to="/" className="hover:text-brand-brown transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="capitalize">{product.category || "Collection"}</span>
          <span>/</span>
          <span className="font-bold text-brand-dark dark:text-white truncate max-w-[200px]">
            {title}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-10 lg:px-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-zinc-800 dark:bg-gray-900">
              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-brand-brown px-3 py-1 text-xs font-bold text-white shadow-sm">
                  {discount}% Off
                </span>
              )}
              <img
                src={activeImage || imageSrc}
                alt={title}
                className="w-full h-auto max-h-[500px] rounded-lg object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 hover:scale-105"
              />
            </div>

            <div className="flex gap-4">
              {(product.images?.length ? product.images : [product.image || defaultImage]).map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`relative cursor-pointer overflow-hidden rounded-xl border-2 bg-white p-2 dark:bg-gray-900 transition-colors ${(activeImage || imageSrc) === img
                      ? "border-brand-brown"
                      : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                >
                  <img
                    src={img}
                    alt={`${title} view ${i + 1}`}
                    className="h-16 w-16 object-contain mix-blend-multiply dark:mix-blend-normal"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-flex rounded-full bg-brand-sand/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-brown dark:bg-brand-brown/20 dark:text-brand-brown-light">
                {product.category || "Furniture"}
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight dark:text-white md:text-4xl">
                {title}
              </h1>

              <div className="mt-4 flex items-center gap-3">
                <Stars rating={Math.round(product.rating || 0)} />
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  {(product.rating || 0).toFixed(1)} ({product.numReviews || 0} customer {(product.numReviews || 0) === 1 ? "review" : "reviews"})
                </span>
              </div>

            </div>

            <div className="rounded-2xl bg-[#F4F2EB] p-5 dark:bg-gray-900 border border-zinc-200/40 dark:border-zinc-800/80">
              <div className="flex items-baseline gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-black text-brand-brown dark:text-brand-brown-light">
                      ₹ {discountedPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-base text-zinc-400 line-through dark:text-zinc-500">
                      ₹ {price.toLocaleString("en-IN")}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-brand-brown dark:text-brand-brown-light">
                    ₹ {price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                Taxes included. Hand-delivered locally within 3-5 business days.
              </p>
            </div>

            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {product.description || defaultDescription}
            </p>

            {/* Render stock level info */}
            {product.stock !== undefined && (
              product.stock <= 0 ? (
                <p className="text-sm font-bold text-red-500 mt-2">✕ Out of Stock</p>
              ) : product.stock <= 5 ? (
                <p className="text-sm font-bold text-orange-500 mt-2">⚠️ Only {product.stock} left in stock - order soon!</p>
              ) : (
                <p className="text-sm text-green-600 font-semibold mt-2">✓ In Stock ({product.stock} available)</p>
              )
            )}

            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center rounded-full border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-gray-900">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-zinc-500 hover:text-brand-dark dark:hover:text-white"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock !== undefined ? product.stock : 20, quantity + 1))}
                    disabled={product.stock <= 0}
                    className="p-2 text-zinc-500 hover:text-brand-dark dark:hover:text-white disabled:opacity-30"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (product.stock <= 0) return;
                    if (isProductInCart) {
                      setIsCartOpen(true);
                      return;
                    }
                    handleAddToCart();
                  }}
                  disabled={product.stock <= 0}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 px-6 font-bold text-white transition-all shadow-md active:scale-95 ${
                    product.stock <= 0
                      ? "bg-zinc-400 cursor-not-allowed"
                      : isProductInCart
                      ? "bg-brand-brown hover:bg-brand-brown-dark"
                      : addedToCart
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-brand-brown hover:bg-brand-brown-dark"
                  }`}
                >
                  {product.stock <= 0 ? (
                    "Out of Stock"
                  ) : isProductInCart ? (
                    <>
                      <FiShoppingCart size={18} /> Go to Cart
                    </>
                  ) : addedToCart ? (
                    <>
                      <FiCheck size={18} /> Added to Cart
                    </>
                  ) : (
                    <>
                      <FiShoppingCart size={18} /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 px-6 font-bold text-white transition-all shadow-md active:scale-95 border ${
                    product.stock <= 0
                      ? "bg-zinc-300 border-zinc-300 text-zinc-500 cursor-not-allowed"
                      : "bg-brand-dark hover:bg-brand-dark/90 border-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  }`}
                >
                  Buy Now
                </button>


                <button
                  onClick={() => toggleWishlist(product)}
                  className={`rounded-full border p-3.5 transition-colors ${isInWishlist(product._id || product.id)
                      ? "bg-red-50 border-red-200 text-red-500 dark:bg-red-950/20 dark:border-red-900"
                      : "bg-white border-zinc-300 text-zinc-500 hover:text-brand-dark dark:bg-gray-900 dark:border-zinc-700 dark:hover:text-white"
                    }`}
                >
                  <FiHeart
                    className={isInWishlist(product._id || product.id) ? "fill-current" : ""}
                    size={18}
                  />
                </button>
              </div>
            </div>

            <div className="grid gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800 sm:grid-cols-3 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <FiTruck className="text-brand-brown flex-shrink-0" size={16} />
                <span>Free local shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <FiShield
                  className="text-brand-brown flex-shrink-0"
                  size={16}
                />
                <span>2-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <FiRotateCcw
                  className="text-brand-brown flex-shrink-0"
                  size={16}
                />
                <span>15-Day simple return</span>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            {[
              { id: "details", label: "Details" },
              { id: "specs", label: "Specifications" },
              { id: "reviews", label: `Reviews (${product.numReviews || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-6 text-sm font-bold transition-all relative -mb-px ${activeTab === tab.id
                    ? "text-brand-brown border-b-2 border-brand-brown dark:text-brand-brown-light"
                    : "text-zinc-400 hover:text-brand-dark dark:hover:text-white"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === "details" && (
              <div className="max-w-3xl space-y-4">
                <h3 className="text-lg font-bold dark:text-white">
                  Product Overview
                </h3>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {product.description || defaultDescription}
                </p>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  Add elegance and high utility to your living space with{" "}
                  {title}. Featuring premium woodwork, clean detailing, and
                  strong frames, it delivers premium comfort and matches
                  standard setups instantly. Perfect for lounging, entertaining
                  guests, or working from home.
                </p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="max-w-2xl rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-gray-900 overflow-hidden">
                <table className="min-w-full text-left text-sm divide-y divide-zinc-100 dark:divide-zinc-800">
                  <tbody>
                    {specifications.map((spec, i) => (
                      <tr
                        key={i}
                        className="divide-x divide-zinc-100 dark:divide-zinc-800"
                      >
                        <td className="px-6 py-4 font-bold text-zinc-500 bg-[#FAF9F5] dark:bg-gray-950 dark:text-zinc-400 w-1/3">
                          {spec.label}
                        </td>
                        <td className="px-6 py-4 dark:text-white">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (() => {
              const reviewsCount = product.reviews?.length || 0;
              const ratingsBreakdown = [5, 4, 3, 2, 1].map((stars) => {
                const count = product.reviews?.filter((r) => Math.round(r.rating) === stars).length || 0;
                const pct = reviewsCount > 0 ? Math.round((count / reviewsCount) * 100) : 0;
                return { stars, pct };
              });
              
              // Calculate percent of reviews that are 4 or 5 stars
              const positiveReviews = product.reviews?.filter((r) => r.rating >= 4).length || 0;
              const recommendPct = reviewsCount > 0 ? Math.round((positiveReviews / reviewsCount) * 100) : 0;

              return (
                <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
                  <div className="space-y-4 rounded-2xl bg-white p-6 border border-zinc-200/60 shadow-sm dark:bg-gray-900 dark:border-zinc-800 self-start">
                    <h4 className="text-base font-bold dark:text-white">
                      Customer Rating
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-brand-dark dark:text-white">
                        {(product.rating || 0).toFixed(1)}
                      </span>
                      <span className="text-sm text-zinc-400">/ 5.0</span>
                    </div>
                    <Stars rating={Math.round(product.rating || 0)} />
                    <p className="text-xs text-zinc-400">
                      {reviewsCount > 0 
                        ? `${recommendPct}% of buyers recommended this product.` 
                        : "No ratings yet."}
                    </p>

                    <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      {ratingsBreakdown.map((row) => (
                        <div
                          key={row.stars}
                          className="flex items-center gap-3 text-xs text-zinc-500"
                        >
                          <span className="w-3">{row.stars}</span>
                          <FiStar
                            size={10}
                            className="text-brand-gold fill-current"
                          />
                          <div className="h-2 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-brand-gold"
                              style={{ width: `${row.pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right">{row.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Write Review Section / Prompt */}
                    <div className="rounded-2xl border border-zinc-200/40 bg-white/50 p-6 dark:border-zinc-800/80 dark:bg-gray-900/40">
                      <h4 className="text-base font-bold mb-4 dark:text-white">
                        Write a Review
                      </h4>
                      {isLoggedIn ? (() => {
                        const hasReviewed = product.reviews?.some(
                          (r) => r.user === user?._id || r.user?._id === user?._id
                        );

                        if (hasReviewed) {
                          return (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              You have already reviewed this product. Thank you for your feedback!
                            </p>
                          );
                        }

                        return (
                          <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                                Your Rating
                              </label>
                              <div className="flex gap-1 items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    type="button"
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-colors"
                                  >
                                    <FiStar
                                      size={24}
                                      className={`${
                                        star <= (hoverRating || rating)
                                          ? "text-brand-gold fill-current"
                                          : "text-zinc-300 dark:text-zinc-700"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                                Your Comment
                              </label>
                              <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts about this product..."
                                required
                                rows={4}
                                className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-sm focus:border-brand-brown focus:outline-none dark:border-zinc-800 dark:bg-gray-900 focus:ring-1 focus:ring-brand-brown"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={submittingReview}
                              className="rounded-full bg-brand-brown px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-brown-dark transition-colors disabled:opacity-50"
                            >
                              {submittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                          </form>
                        );
                      })() : (
                        <div className="text-center py-2">
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                            Please log in to write a review.
                          </p>
                          <button
                            onClick={() => navigate("/login", { state: { from: location } })}
                            className="rounded-full bg-brand-brown px-6 py-2 text-xs font-bold text-white hover:bg-brand-brown-dark transition-colors"
                          >
                            Log In
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6 pt-4">
                      <h4 className="text-base font-bold dark:text-white">
                        Reviews ({reviewsCount})
                      </h4>
                      {reviewsCount === 0 ? (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                          No reviews yet. Be the first to review this product!
                        </p>
                      ) : (
                        [...product.reviews].reverse().map((review) => (
                          <article
                            key={review._id || review.id}
                            className="rounded-2xl border border-zinc-200/40 bg-white/50 p-6 dark:border-zinc-800/80 dark:bg-gray-900/40"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold dark:text-white">
                                    {review.name}
                                  </span>
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-bold text-green-700 dark:bg-green-950/20 dark:text-green-400">
                                    <FiCheck size={10} /> Verified Buyer
                                  </span>
                                </div>
                                <p className="mt-0.5 text-xs text-zinc-400">
                                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                              <Stars rating={review.rating} />
                            </div>
                            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                              {review.comment}
                            </p>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="mb-8 text-2xl font-black tracking-tight dark:text-white">
              Related Products
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id || p.id} p={p} size="md" />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
