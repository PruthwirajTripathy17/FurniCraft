import Category from "../models/Category.js";

export async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, designing } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.create({
      name,
      designing: designing || "",
    });

    return res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Category name already exists" });
    }
    return res.status(500).json({ message: "Failed to create category" });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Category name already exists" });
    }
    return res.status(500).json({ message: "Failed to update category" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({ message: "Category deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete category" });
  }
}
