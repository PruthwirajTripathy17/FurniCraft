import Blog from "../models/Blog.js";

export async function getBlogs(req, res) {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.json(blogs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch blogs" });
  }
}

export async function createBlog(req, res) {
  try {
    const { category, title, content, author } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Blog title is required" });
    }

    const blog = await Blog.create({
      category: category || "General",
      title,
      content: content || "",
      author: author || "Admin",
    });

    return res.status(201).json(blog);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create blog" });
  }
}

export async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.json(blog);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update blog" });
  }
}

export async function deleteBlog(req, res) {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.json({ message: "Blog deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete blog" });
  }
}

export async function getBlog(req, res) {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.json(blog);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch blog" });
  }
}

