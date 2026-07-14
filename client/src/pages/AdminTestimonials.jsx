import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import { FcSearch } from "react-icons/fc";
import { TableRowSkeleton } from "../components/skeleton/Skeletons";
import Swal from "sweetalert2";

const emptyForm = { name: "", role: "", rating: 5, feedback: "" };

export default function AdminTestimonials() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("id");

  const [testimonials, setTestimonials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(
    () =>
      testimonials.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.feedback.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [testimonials, searchTerm],
  );

  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      role: item.role || "",
      rating: item.rating || 5,
      feedback: item.feedback || "",
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    apiRequest("/testimonials")
      .then((data) => {
        setTestimonials(data);
        if (highlightId) {
          const item = data.find((t) => t._id === highlightId);
          if (item) {
            openEdit(item);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [highlightId]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      if (editingId) {
        const updated = await apiRequest(`/testimonials/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setTestimonials((prev) =>
          prev.map((t) => (t._id === updated._id ? updated : t)),
        );
      } else {
        const created = await apiRequest("/testimonials", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setTestimonials((prev) => [created, ...prev]);
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
          await apiRequest(`/testimonials/${id}`, { method: "DELETE" });
          setTestimonials((prev) => prev.filter((t) => t._id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Testimonial has been deleted.",
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
            text: "Failed to delete the testimonial.",
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
            Testimonials
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage client feedback — name, role, rating, and feedback text.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <FcSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search testimonials..."
              className="w-full bg-transparent outline-none dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={openAdd}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            Add Testimonial
          </button>
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="mb-6 text-2xl font-bold dark:text-white">
              {editingId ? "Update Testimonial" : "Add Testimonial"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Role
                </label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Interior Designer"
                  className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) =>
                    setForm({ ...form, rating: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Feedback
                </label>
                <textarea
                  value={form.feedback}
                  onChange={(e) =>
                    setForm({ ...form, feedback: e.target.value })
                  }
                  placeholder="Client feedback text"
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
                Role
              </th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Rating
              </th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                Feedback
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
                  No testimonials yet. Add client feedback to get started.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-4 font-medium dark:text-white">
                    {item.name}
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                    {item.role}
                  </td>
                  <td className="px-4 py-4 dark:text-white">{item.rating}/5</td>
                  <td className="max-w-xs truncate px-4 py-4 text-gray-600 dark:text-gray-400">
                    {item.feedback}
                  </td>
                  <td className="px-4 py-4 space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="rounded-lg border border-yellow-500 px-3 py-2 text-xs text-yellow-600 hover:bg-yellow-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
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
