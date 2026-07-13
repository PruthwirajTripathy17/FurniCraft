import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { apiRequest } from "../services/api";
import { ProductCardSkeleton } from "./skeleton/Skeletons";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/products")
      .then((data) => setProducts(data.filter((item) => item.isFeatured)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="px-5 py-16 md:px-10 lg:px-20">
      <div className="mb-12 text-center">
        <div className="mb-3.5 inline-block border border-brand-gold px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-brown">
          Top Sale
        </div>
        <h2 className="text-4xl font-black text-brand-dark md:text-[44px]">Featured Product</h2>
      </div>

      <div className="relative">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <ProductCardSkeleton count={4} />
          ) : products.length === 0 ? (
            <p className="col-span-4 text-center text-zinc-500">No featured products yet.</p>
          ) : (
            products.slice(0, 4).map((p) => (
              <ProductCard key={p._id || p.id} p={p} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
