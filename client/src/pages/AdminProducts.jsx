import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";
import { FcSearch } from "react-icons/fc";
import { TableRowSkeleton } from "../components/skeleton/Skeletons";
import Swal from "sweetalert2";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const defaultImage =
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    title: "",
    featured: false,
    price: 0,
    discount: 0,
    category: "",
    file: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    featured: false,
    price: 0,
    discount: 0,
    category: "",
    file: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          apiRequest("/products"),
          apiRequest("/categories"),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      featured: false,
      price: 0,
      discount: 0,
      category: categories[0]?.name || "",
      file: null,
    });

    setEditForm({
      title: "",
      featured: false,
      price: 0,
      discount: 0,
      category: categories[0]?.name || "",
      file: null,
    });

    setImagePreview(null);
  };

  const uploadImage = async (file) => {
    setIsUploading(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_BASE_URL}/products/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed");
      }

      return data.imageUrl;
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const updated = await apiRequest(
        `/products/${product._id || product.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ isFeatured: !product.isFeatured }),
        },
      );
      setProducts((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      width: "360px",
      customClass: {
        popup: "rounded-2xl dark:bg-gray-900 dark:text-white dark:border dark:border-gray-800",
        title: "text-lg font-bold text-gray-950 dark:text-white",
        htmlContainer: "text-xs text-gray-500 dark:text-gray-400",
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiRequest(`/products/${id}`, { method: "DELETE" });
          setProducts((current) =>
            current.filter((product) => (product._id || product.id) !== id),
          );
          if (editingId === id) {
            setEditingId(null);
            resetForm();
          }
          Swal.fire({
            title: "Deleted!",
            text: "Product has been deleted.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            width: "360px",
            customClass: {
              popup: "rounded-2xl dark:bg-gray-900 dark:text-white dark:border dark:border-gray-800",
              title: "text-lg font-bold text-gray-950 dark:text-white",
              htmlContainer: "text-xs text-gray-500 dark:text-gray-400",
            }
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete the product.",
            icon: "error",
            width: "360px",
            customClass: {
              popup: "rounded-2xl dark:bg-gray-900 dark:text-white dark:border dark:border-gray-800",
              title: "text-lg font-bold text-gray-950 dark:text-white",
              htmlContainer: "text-xs text-gray-500 dark:text-gray-400",
            }
          });
        }
      }
    });
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();

    if (!form.title) return;

    try {
      const imageUrl = form.file ? await uploadImage(form.file) : defaultImage;

      const created = await apiRequest("/products", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          images: [imageUrl],
          price: Number(form.price) || 0,
          isFeatured: Boolean(form.featured),
          discount: Number(form.discount) || 0,
          category: form.category || categories[0]?.name || "Furniture",
        }),
      });

      setProducts((current) => [created, ...current]);

      setIsModalOpen(false); 
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id || product.id);

    setEditForm({
      title: product.title,
      featured: product.isFeatured,
      price: product.price || 0,
      discount: product.discount || 0,
      category: product.category || categories[0]?.name || "",
      file: null,
    });

    setImagePreview(product.images?.[0] || defaultImage);

    setIsModalOpen(true);
  };

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    if (!editForm.title || editingId === null) return;

    try {
      const imageUrl = editForm.file
        ? await uploadImage(editForm.file)
        : products.find((p) => (p._id || p.id) === editingId)?.images?.[0] ||
          defaultImage;

      const updated = await apiRequest(`/products/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title,
          images: [imageUrl],
          price: Number(editForm.price) || 0,
          isFeatured: Boolean(editForm.featured),
          discount: Number(editForm.discount) || 0,
          category: editForm.category || categories[0]?.name || "Furniture",
        }),
      });

      setProducts((current) =>
        current.map((product) =>
          (product._id || product.id) === editingId ? updated : product,
        ),
      );

      setEditingId(null);
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    if (editingId) {
      setEditForm((prev) => ({
        ...prev,
        file,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        file,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search, create, update, and delete products.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <span className="text-gray-500">
              <FcSearch />
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent outline-none dark:text-white"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              resetForm();
              setIsModalOpen(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 shadow-md active:scale-95 transition-all"
          >
            Add Product
          </button>
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 p-4 shadow-xl border border-zinc-100 dark:border-zinc-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold dark:text-white">
                {editingId ? "Update Product" : "Add Product"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={editingId ? handleUpdateProduct : handleAddProduct}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Product Title
                </label>
                <input
                  value={editingId ? editForm.title : form.title}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, title: e.target.value })
                      : setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Enter product title"
                  className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                    Product Image
                  </label>

                  <label className="flex h-48 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    {isUploading ? (
                      <div className="w-full px-4">
                        <p className="mb-2 text-center text-sm text-blue-600">
                          Uploading image...
                        </p>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div className="h-full animate-pulse bg-blue-600"></div>
                        </div>
                      </div>
                    ) : imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <p className="font-medium text-gray-600 dark:text-gray-400">
                          Click to Upload Image
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">JPG, PNG, WEBP</p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>

                <div className="hidden" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Category
                </label>
                <select
                  value={editingId ? editForm.category : form.category}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, category: e.target.value })
                      : setForm({ ...form, category: e.target.value })
                  }
                  className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {categories.length === 0 ? (
                    <option value="Furniture">
                      Furniture (add categories in admin)
                    </option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                    Price
                  </label>

                  <input
                    type="number"
                    value={editingId ? editForm.price : form.price}
                    onChange={(e) =>
                      editingId
                        ? setEditForm({
                            ...editForm,
                            price: e.target.value,
                          })
                        : setForm({
                            ...form,
                            price: e.target.value,
                          })
                    }
                    className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                    Discount (%)
                  </label>

                  <input
                    type="number"
                    value={editingId ? editForm.discount : form.discount}
                    onChange={(e) =>
                      editingId
                        ? setEditForm({
                            ...editForm,
                            discount: e.target.value,
                          })
                        : setForm({
                            ...form,
                            discount: e.target.value,
                          })
                    }
                    className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={editingId ? editForm.featured : form.featured}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({
                          ...editForm,
                          featured: e.target.checked,
                        })
                      : setForm({
                          ...form,
                          featured: e.target.checked,
                        })
                  }
                />
                Featured Product
              </label>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="rounded-lg border px-5 py-2 dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                  {editingId ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Title</th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Category</th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Featured</th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-900 dark:divide-gray-700">
            {loading ? (
              <TableRowSkeleton rows={5} cols={4} />
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id || product.id}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || defaultImage}
                        alt={product.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium dark:text-white">{product.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                      {product.category || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        product.isFeatured
                          ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {product.isFeatured ? "Featured" : "Standard"}
                    </span>
                  </td>
                  <td className="px-4 py-4 space-x-2">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(product)}
                      className="rounded-lg border border-indigo-500 px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-semibold transition-all duration-200"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="rounded-lg border border-yellow-500 px-3 py-2 text-xs text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/40"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={Boolean(product.isFeatured)}
                      onClick={() => handleToggleFeatured(product)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${product.isFeatured ? "bg-blue-500" : "bg-gray-400"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${product.isFeatured ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product._id || product.id)}
                      className="rounded-lg border border-red-500 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isDetailsModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-zinc-100 dark:border-zinc-800 text-left">
           
            <div className="flex items-center justify-between border-b pb-4 mb-4 dark:border-gray-800">
              <div>
                <span className="inline-flex rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
                  {selectedProduct.category || "Furniture"}
                </span>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white truncate max-w-[450px]">
                  {selectedProduct.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold transition-all"
              >
                ×
              </button>
            </div>

           
            <div className="grid gap-6 md:grid-cols-2 items-start max-h-[60vh] overflow-y-auto pr-2">
              
              <div className="relative overflow-hidden rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 p-4 shadow-inner flex items-center justify-center">
                {selectedProduct.discount > 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-brand-brown px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {selectedProduct.discount}% Off
                  </span>
                )}
                <img
                  src={selectedProduct.images?.[0] || selectedProduct.image || defaultImage}
                  alt={selectedProduct.title}
                  className="w-full h-auto max-h-[260px] object-contain rounded-lg transition-transform duration-300 hover:scale-105"
                />
              </div>

             
              <div className="space-y-4">
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-150/40 dark:border-zinc-800/80 space-y-2.5">
                  <div className="flex justify-between text-xs border-b pb-2 dark:border-zinc-800">
                    <span className="text-zinc-500 font-medium">Product ID:</span>
                    <span className="text-zinc-800 dark:text-zinc-300 font-mono font-bold select-all">
                      {selectedProduct._id || selectedProduct.id}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-b pb-2 dark:border-zinc-800">
                    <span className="text-zinc-500 font-medium">Original Price:</span>
                    <span className="text-zinc-800 dark:text-zinc-300 font-bold">
                      ₹ {selectedProduct.price?.toLocaleString("en-IN") || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-b pb-2 dark:border-zinc-800">
                    <span className="text-zinc-500 font-medium">Active Discount:</span>
                    <span className="text-red-500 font-bold">
                      {selectedProduct.discount || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-b pb-2 dark:border-zinc-800">
                    <span className="text-zinc-500 font-medium">Selling Price:</span>
                    <span className="text-green-600 font-black">
                      ₹ {((selectedProduct.price || 0) - ((selectedProduct.price || 0) * (selectedProduct.discount || 0)) / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-b pb-2 dark:border-zinc-800">
                    <span className="text-zinc-500 font-medium">Units Sold:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">
                      {selectedProduct.sold || 0} units
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-b pb-2 dark:border-zinc-800">
                    <span className="text-zinc-500 font-medium">Featured Status:</span>
                    <span className={`font-bold ${selectedProduct.isFeatured ? "text-green-600" : "text-zinc-400"}`}>
                      {selectedProduct.isFeatured ? "Featured Product" : "Standard Product"}
                    </span>
                  </div>
                  {selectedProduct.createdAt && (
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Created: {new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
                      <span>Modified: {new Date(selectedProduct.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

           
            <div className="mt-5 border-t pt-4 dark:border-gray-800">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">
                Product Description
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-h-[100px] overflow-y-auto">
                {selectedProduct.description || "No description provided for this item."}
              </p>
            </div>

            
            <div className="mt-6 flex justify-end gap-3 border-t pt-4 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleEdit(selectedProduct);
                }}
                className="rounded-xl bg-yellow-500 hover:bg-yellow-600 px-5 py-2 text-white font-bold text-xs transition shadow-sm active:scale-95"
              >
                Edit Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-5 py-2 text-gray-700 dark:text-gray-300 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
