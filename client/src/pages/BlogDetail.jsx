import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import { FiArrowLeft, FiUser, FiCalendar, FiBookOpen } from "react-icons/fi";

const defaultImage =
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80";

const getEmoji = (category) => {
  const c = (category || "").toLowerCase();
  if (c.includes("chair")) return "🛋️ CHAIR DESIGN";
  if (c.includes("sofa")) return "🛋️ SOFA COMFORT";
  if (c.includes("table")) return "🪵 WOODEN TABLE";
  return "📖 FURNITURE INSIGHTS";
};

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const blogData = await apiRequest(`/blogs/${id}`);
        setBlog(blogData);
      } catch (err) {
        console.error(err);
        setError("Blog post not found or failed to load. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-4 py-20 dark:bg-gray-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-brand-brown"></div>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
          Loading post details...
        </p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h2 className="mb-4 text-2xl font-black text-brand-dark dark:text-white">
          Blog Post Not Found
        </h2>
        <p className="mb-8 text-zinc-500 dark:text-zinc-400">
          {error || "The blog post you're looking for does not exist."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-full bg-brand-brown px-6 py-3 font-bold text-white hover:bg-brand-brown-dark transition-colors"
        >
          <FiArrowLeft /> Back to Home
        </button>
      </div>
    );
  }

  return (
    <main className="bg-[#FAF9F5] text-brand-dark transition-colors duration-300 dark:bg-gray-950 dark:text-white min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="border-b border-zinc-200 bg-white/50 px-5 py-4 dark:border-zinc-800 dark:bg-gray-900/50 md:px-10 lg:px-20">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
          <Link to="/" className="hover:text-brand-brown transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="capitalize">{blog.category || "Blog"}</span>
          <span>/</span>
          <span className="font-bold text-brand-dark dark:text-white truncate max-w-[200px]">
            {blog.title}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-12 md:px-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-brand-brown hover:text-brand-brown-dark dark:text-brand-brown-light transition-colors group"
        >
          <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Back
        </button>

        <article className="overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-gray-900">
          {/* Header Banner */}
          <div className="relative h-[250px] md:h-[400px] w-full bg-brand-sand/50 overflow-hidden flex items-center justify-center">
            {blog.image ? (
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center p-6">
                <FiBookOpen size={48} className="text-brand-brown/60" />
                <span className="text-xl font-black text-brand-brown">
                  {getEmoji(blog.category)}
                </span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="rounded-full bg-brand-brown px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                {blog.category || "Insights"}
              </span>
            </div>
          </div>

          {/* Content Card */}
          <div className="px-6 py-8 md:px-12 md:py-10">
            <h1 className="text-3xl font-black tracking-tight text-brand-dark dark:text-white md:text-4xl lg:text-5xl leading-tight mb-6">
              {blog.title}
            </h1>

            {/* Author and Date Meta */}
            <div className="flex flex-wrap items-center gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-8 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-brand-sand text-brand-brown font-bold dark:bg-zinc-800">
                  <FiUser size={12} />
                </div>
                <span>By <span className="font-bold text-zinc-700 dark:text-zinc-300">{blog.author || "Admin"}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar size={14} className="text-brand-brown" />
                <span>Published on {formatDate(blog.createdAt)}</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="text-base md:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {blog.content || "No content available for this blog post."}
              </p>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
