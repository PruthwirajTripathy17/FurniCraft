import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { BlogCardSkeleton } from "./skeleton/Skeletons";

const RecentBlog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/blogs")
      .then(setBlogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getEmoji = (category) => {
    const c = (category || "").toLowerCase();
    if (c.includes("chair")) return "CHR";
    if (c.includes("sofa")) return "SOFA";
    if (c.includes("table")) return "TBL";
    return "BLOG";
  };

  return (
    <section id="blog" className="bg-brand-cream px-5 py-16 md:px-10 lg:px-20">
      <div className="mb-12 text-center">
        <div className="mb-3.5 inline-block border border-brand-gold px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-brown">
          Read Blog
        </div>
        <h2 className="text-4xl font-black text-brand-dark md:text-[44px]">Recent Blog</h2>
      </div>

      <div className="mx-auto grid max-w-[920px] gap-6 lg:grid-cols-2">
        {loading ? (
          <BlogCardSkeleton count={2} />
        ) : blogs.length === 0 ? (
          <p className="col-span-2 text-center text-zinc-500">No blog posts yet.</p>
        ) : (
          blogs.slice(0, 4).map((blog) => (
            <article
              key={blog._id}
              className="flex flex-col gap-6 rounded-xl bg-white px-6 py-7 shadow-[0_2px_20px_rgba(0,0,0,.06)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,.1)] sm:flex-row sm:items-start sm:px-8"
            >
              <div className="flex-1">
                <div className="mb-3 inline-block rounded-full bg-brand-cream px-3.5 py-1 text-xs text-brand-brown">
                  {blog.category}
                </div>
                <div className="mb-2 text-xs text-zinc-400">
                  By {blog.author} — {formatDate(blog.createdAt)}
                </div>
                <h4 className="mb-3 text-lg font-black leading-snug text-brand-dark">
                  {blog.title}
                </h4>
                {blog.content && (
                  <p className="mb-5 line-clamp-4 text-sm text-zinc-600">{blog.content}</p>
                )}
                <button
                  onClick={() => navigate(`/blog/${blog._id}`)}
                  className="size-9 rounded-full bg-brand-cream text-lg text-brand-brown transition-colors hover:bg-brand-brown hover:text-white"
                >
                  &gt;
                </button>
              </div>
              <div className="flex size-[140px] flex-shrink-0 items-center justify-center rounded-lg bg-brand-sand text-3xl font-black text-brand-brown overflow-hidden">
                {blog.image ? (
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  getEmoji(blog.category)
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default RecentBlog;
