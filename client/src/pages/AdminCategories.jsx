import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";
import { FcSearch } from "react-icons/fc";
import { TableRowSkeleton } from "../components/skeleton/Skeletons";
import Swal from "sweetalert2";

const emptyForm = { name: "", designing: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(
    () =>
      categories.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [categories, searchTerm],
  );

  const loadCategories = async () => {
    try {
      const data = await apiRequest("/categories");
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name, designing: category.designing || "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      if (editingId) {
        const updated = await apiRequest(`/categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setCategories((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c)),
        );
      } else {
        const created = await apiRequest("/categories", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setCategories((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
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
          await apiRequest(`/categories/${id}`, { method: "DELETE" });
          setCategories((prev) => prev.filter((c) => c._id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Category has been deleted.",
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
            text: "Failed to delete the category.",
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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage category names and designing descriptions.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <FcSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="w-full bg-transparent outline-none dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={openAdd}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            Add Category
          </button>
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="mb-6 text-2xl font-bold dark:text-white">
              {editingId ? "Update Category" : "Add Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Furniture, Chair, Sofa"
                  className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Designing
                </label>
                <textarea
                  value={form.designing}
                  onChange={(e) =>
                    setForm({ ...form, designing: e.target.value })
                  }
                  placeholder="Category description / design notes"
                  rows={4}
                  className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border px-5 py-2 dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-white"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Name
              </th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Designing
              </th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {loading ? (
              <TableRowSkeleton rows={4} cols={3} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No categories yet. Add one to get started.
                </td>
              </tr>
            ) : (
              filtered.map((category) => (
                <tr key={category._id}>
                  <td className="px-4 py-4 font-medium dark:text-white">
                    {category.name}
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                    {category.designing || "—"}
                  </td>
                  <td className="px-4 py-4 space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      className="rounded-lg border border-yellow-500 px-3 py-2 text-xs text-yellow-600 hover:bg-yellow-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(category._id)}
                      className="rounded-lg border border-red-500 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
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
    </div>
  );
}
