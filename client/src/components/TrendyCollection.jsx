import { useEffect, useMemo, useState, useContext } from "react";
import ProductCard from "./ProductCard";
import { apiRequest } from "../services/api";
import { ProductCardSkeleton } from "./skeleton/Skeletons";
import { ShopContext } from "../context/ShopContext";

const TrendyCollection = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, activeTab, setActiveTab } = useContext(ShopContext);

  useEffect(() => {
    Promise.all([apiRequest("/products"), apiRequest("/categories")])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tabs = useMemo(
    () => ["All Collection", ...categories.map((c) => c.name)],
    [categories],
  );

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeTab !== "All Collection") {
      list = list.filter(
        (p) => p.category?.toLowerCase() === activeTab.toLowerCase(),
      );
    }
    if (searchQuery.trim()) {
      list = list.filter((p) =>
        (p.title || p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [products, activeTab, searchQuery]);

  return (
    <section id="shop" className="px-5 py-16 md:px-10 lg:px-20">
      <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            This Month
          </div>
          <h2 className="text-4xl font-black text-brand-dark md:text-[40px]">Trendy Collection</h2>
        </div>
        <div className="flex flex-wrap items-center gap-5 lg:gap-6 lg:pt-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-1 text-sm transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-brand-brown font-bold text-brand-dark"
                  : "font-normal text-zinc-400 hover:text-brand-dark"
              }`}
            >
              {tab}
              {tab === "All Collection" && (
                <span className="absolute -right-4 -top-3 inline-flex size-[17px] items-center justify-center rounded-full bg-brand-brown text-[9px] font-bold text-white">
                  {products.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <ProductCardSkeleton count={8} size="md" />
        ) : filteredProducts.length === 0 ? (
          <p className="col-span-4 text-center text-zinc-500">
            No products in this category yet.
          </p>
        ) : (
          filteredProducts.slice(0, 8).map((p) => (
            <ProductCard key={p._id || p.id} p={p} size="md" />
          ))
        )}
      </div>
    </section>
  );
};

export default TrendyCollection;
