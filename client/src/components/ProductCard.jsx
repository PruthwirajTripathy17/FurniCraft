import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { AuthContext } from "../context/auth-context";
import Badge from "./Badge";
import Stars from "./Stars";
import premiumChairsImage from "../assets/premium-chairs.png";
import { FaHeart } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import Swal from "sweetalert2";

const imagePositions = {
  ARM: "object-[50%_center]",
  CHR: "object-[84%_center]",
  PIL: "object-[16%_center]",
  SOFA: "object-[16%_center]",
};

const ProductCard = ({ p, size = "lg" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useContext(AuthContext);
  const { cart, addToCart, toggleWishlist, isInWishlist, setIsCartOpen, setIsWishlistOpen } = useContext(ShopContext);
  const imageHeight = size === "lg" ? "h-[204px]" : "h-[169px]";
  const frameHeight = size === "lg" ? "min-h-[220px]" : "min-h-[185px]";
  const imageSrc = p.images?.[0] || p.image || premiumChairsImage;
  const title = p.title || p.name || "Furniture Item";
  const price = p.price || 0;
  const discount = Number(p.discount || 0);
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount ? price - (price * discount) / 100 : price;
  const productId = p._id || p.id;
  const isProductInCart = cart.some((item) => (item._id || item.id) === productId);


  return (
    <article
      onClick={() => navigate(`/product/${productId}`)}
      className="group cursor-pointer"
    >
      <div
        className={`relative mb-3.5 flex ${frameHeight} items-center justify-center overflow-hidden rounded-xl bg-brand-sand px-4 py-8 transition-shadow duration-300 group-hover:shadow-[0_8px_28px_rgba(0,0,0,.12)]`}
      >
        {discount > 0 && <Badge label={`${discount}% Off`} />}
        {p.badge && <Badge label={p.badge} className="left-3 top-11 bg-brand-dark" />}
        
        {/* Wishlist Button in Top-Right Corner */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(p);
            setIsWishlistOpen(true);
          }}
          className={`absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-200 hover:scale-110 active:scale-90 ${isInWishlist(productId)
              ? "text-red-500 hover:bg-red-50"
              : "text-zinc-600 hover:bg-zinc-50"
            }`}
          aria-label="Add to wishlist"
        >
          <FaHeart className={isInWishlist(productId) ? "fill-current" : ""} size={14} />
        </button>

        <img
          src={imageSrc}
          alt={title}
          className={`w-full ${imageHeight} object-cover ${imagePositions[p.emoji] || "object-[84%_center]"} mix-blend-multiply transition-transform duration-300 group-hover:scale-105`}
        />
      </div>

      {/* Title & Cart Button Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="text-sm font-bold text-brand-dark truncate">{title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
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
            if (isProductInCart) {
              setIsCartOpen(true);
              return;
            }
            addToCart(p, 1);
            setIsCartOpen(true);
          }}
          className={`flex-shrink-0 flex size-8 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-90 ${
            isProductInCart
              ? "bg-brand-brown text-white shadow-md"
              : "bg-white text-zinc-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-zinc-100 hover:bg-brand-brown hover:text-white"
          }`}
          aria-label={isProductInCart ? "Go to cart" : "Add to cart"}
        >
          <FiShoppingCart size={13} />
        </button>
      </div>

      <Stars rating={p.rating || 0} />
      <div className="mt-1.5 flex items-center gap-2 text-sm font-bold text-brand-brown">
        {hasDiscount ? (
          <>
            <span className="text-gray-500 line-through">
              ₹ {price.toLocaleString("en-IN")}
            </span>
            <span>₹ {discountedPrice.toLocaleString("en-IN")}</span>
          </>
        ) : (
          <span>₹ {price.toLocaleString("en-IN")}</span>
        )}
      </div>

    </article>
  );
};

export default ProductCard;
