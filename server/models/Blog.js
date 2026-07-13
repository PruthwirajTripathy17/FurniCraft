import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    category: { type: String, default: "General" },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    author: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
