import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";
import { FcSearch } from "react-icons/fc";
import { TableRowSkeleton } from "../components/skeleton/Skeletons";

const defaultImage =
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80";

export default function AdminBestSellers() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [products, searchTerm],
  );

  const bestSellerCount = products.filter((p) => p.isBestSeller).length;

  useEffect(() => {
    apiRequest("/products")
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggleBestSeller = async (product) => {
    try {
      const updated = await apiRequest(`/products/${product._id}`, {
        method: "PUT",
        body: JSON.stringify({ isBestSeller: !product.isBestSeller }),
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Best Sellers</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Toggle which products appear in the Best Sellers section. <span className="font-semibold text-indigo-600">{bestSellerCount}</span> marked.
          </p>
        </div>

        <label className="flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <FcSearch />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent outline-none dark:text-white"
          />
        </label>
      </header>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Product</th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Category</th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Price</th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Best Seller</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <TableRowSkeleton rows={5} cols={4} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No products found. Add products first.
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || defaultImage}
                        alt={product.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <span className="font-medium dark:text-white">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                    {product.category || "—"}
                  </td>
                  <td className="px-4 py-4 dark:text-white">
                    ₹ {(product.price || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={Boolean(product.isBestSeller)}
                      onClick={() => handleToggleBestSeller(product)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        product.isBestSeller ? "bg-indigo-600" : "bg-gray-400"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          product.isBestSeller ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
