import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Stars from "./Stars";
import { apiRequest } from "../services/api";
import { BestSellerCardSkeleton } from "./skeleton/Skeletons";

const defaultImage =
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80";

const BestSellers = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/products?isBestSeller=true")
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="px-5 py-16 md:px-10 lg:px-20">
      <div className="mb-9">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
          This Week
        </div>
        <h2 className="text-4xl font-black text-brand-dark md:text-[40px]">Best Sellers</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <BestSellerCardSkeleton count={6} />
        ) : products.length === 0 ? (
          <p className="col-span-3 text-zinc-500">No best sellers marked yet.</p>
        ) : (
          products.map((p) => (
            <article
              key={p._id}
              onClick={() => navigate(`/product/${p._id || p.id}`)}
              className="flex cursor-pointer items-center gap-3.5 rounded-lg bg-[#F8F8F6] px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-product"
            >
              <img
                src={p.images?.[0] || defaultImage}
                alt={p.title}
                className="size-[68px] flex-shrink-0 rounded-lg object-cover"
              />
              <div>
                <div className="mb-1 text-sm font-bold text-brand-dark">{p.title}</div>
                <div className="mb-1.5 text-[13px] font-bold text-brand-brown">
                  ₹ {(p.price || 0).toLocaleString("en-IN")}
                </div>
                <Stars rating={5} />
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default BestSellers;
