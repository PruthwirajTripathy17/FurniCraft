import express from "express";
import {
  createBlog,
  deleteBlog,
  getBlogs,
  getBlog,
  updateBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/:id", getBlog);
router.post("/", createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

export default router;
