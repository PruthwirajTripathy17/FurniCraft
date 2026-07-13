import { useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { AuthContext } from "../context/auth-context";
import { StatsCardSkeleton } from "../components/skeleton/Skeletons";

const defaultImage =
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80";

export default function AdminDashboard() {
  const { adminUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    products: 0,
    featured: 0,
    bestSellers: 0,
    categories: 0,
    blogs: 0,
    testimonials: 0,
  });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [products, categories, blogs, testimonials] = await Promise.all([
          apiRequest("/products"),
          apiRequest("/categories"),
          apiRequest("/blogs"),
          apiRequest("/testimonials"),
        ]);

        setStats({
          products: products.length,
          featured: products.filter((item) => item.isFeatured).length,
          bestSellers: products.filter((item) => item.isBestSeller).length,
          categories: categories.length,
          blogs: blogs.length,
          testimonials: testimonials.length,
        });

        setFeaturedProducts(products.filter((p) => p.isFeatured).slice(0, 4));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statCards = [
    { label: "Available Products", value: stats.products },
    { label: "Featured Products", value: stats.featured },
    { label: "Best Sellers", value: stats.bestSellers },
    { label: "Categories", value: stats.categories },
    { label: "Blogs", value: stats.blogs },
    { label: "Testimonials", value: stats.testimonials },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400"></p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <StatsCardSkeleton count={3} />
        ) : (
          statCards.slice(0, 3).map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.label}
              </p>
              <p className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400">
                {card.value}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {loading ? (
          <StatsCardSkeleton count={3} />
        ) : (
          statCards.slice(3).map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.label}
              </p>
              <p className="text-2xl font-semibold dark:text-white">
                {card.value}
              </p>
            </div>
          ))
        )}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold dark:text-white">
            Admin Profile
          </h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {adminUser?.name || "Admin"}
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {adminUser?.email || "admin@example.com"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold dark:text-white">
            Featured Products
          </h2>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-center gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              ))
            ) : featuredProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No featured products yet.</p>
            ) : (
              featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <img
                    src={product.images?.[0] || defaultImage}
                    alt={product.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold dark:text-white">
                      {product.title}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
