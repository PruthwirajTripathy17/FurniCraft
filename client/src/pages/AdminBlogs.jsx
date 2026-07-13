import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";
import { FcSearch } from "react-icons/fc";
import { TableRowSkeleton } from "../components/skeleton/Skeletons";
import Swal from "sweetalert2";

const emptyForm = { category: "", title: "", content: "", author: "Admin" };

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(
    () =>
      blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.category.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [blogs, searchTerm],
  );

  useEffect(() => {
    apiRequest("/blogs")
      .then(setBlogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (blog) => {
    setEditingId(blog._id);
    setForm({
      category: blog.category || "",
      title: blog.title,
      content: blog.content || "",
      author: blog.author || "Admin",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      if (editingId) {
        const updated = await apiRequest(`/blogs/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setBlogs((prev) =>
          prev.map((b) => (b._id === updated._id ? updated : b)),
        );
      } else {
        const created = await apiRequest("/blogs", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setBlogs((prev) => [created, ...prev]);
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
          await apiRequest(`/blogs/${id}`, { method: "DELETE" });
          setBlogs((prev) => prev.filter((b) => b._id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Blog has been deleted.",
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
            text: "Failed to delete the blog post.",
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

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Blogs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage blog posts shown in the Recent Blog section.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <FcSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blogs..."
              className="w-full bg-transparent outline-none dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={openAdd}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            Add Blog
          </button>
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="mb-6 text-2xl font-bold dark:text-white">
              {editingId ? "Update Blog" : "Add Blog"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Category
                </label>
                <input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="e.g. Chair Design, Sofa Design"
                  className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Blog title"
                  className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Content
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  placeholder="Blog content"
                  rows={4}
                  className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Author
                </label>
                <input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
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

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Category
              </th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Title
              </th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Author
              </th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Date
              </th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <TableRowSkeleton rows={4} cols={5} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No blogs yet. Add one to get started.
                </td>
              </tr>
            ) : (
              filtered.map((blog) => (
                <tr key={blog._id}>
                  <td className="px-4 py-4 dark:text-white">{blog.category}</td>
                  <td className="px-4 py-4 font-medium dark:text-white">
                    {blog.title}
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                    {blog.author}
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                    {formatDate(blog.createdAt)}
                  </td>
                  <td className="px-4 py-4 space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(blog)}
                      className="rounded-lg border border-yellow-500 px-3 py-2 text-xs text-yellow-600 hover:bg-yellow-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(blog._id)}
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
