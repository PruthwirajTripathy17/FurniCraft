import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadDir = path.join(process.cwd(), "tmp", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadProductImage = [
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Please select an image file" });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "furniture-shop",
        resource_type: "image",
      });

      fs.unlinkSync(req.file.path);

      return res.json({ imageUrl: result.secure_url });
    } catch (error) {
      console.error("Cloudinary upload failed", error);
      return res.status(500).json({ message: "Image upload failed", error: error.message });
    }
  },
];

export async function getProducts(req, res) {
  try {
    const filter = {};

    if (req.query.isBestSeller === "true") {
      filter.isBestSeller = true;
    }

    if (req.query.isFeatured === "true") {
      filter.isFeatured = true;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products" });
  }
}

export async function createProduct(req, res) {
  try {
    const { title, description, price, sold, isFeatured, isBestSeller, discount, images, category } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const product = await Product.create({
      title,
      description: description || "",
      price: Number(price) || 0,
      sold: Number(sold) || 0,
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      discount: Number(discount) || 0,
      images: Array.isArray(images) && images.length ? images : ["https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80"],
      category: category || "Furniture",
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create product" });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update product" });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product" });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    console.error("Failed to fetch product by id", error);
    return res.status(500).json({ message: "Failed to fetch product" });
  }
}

export async function addProductReview(req, res) {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews?.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    if (!product.reviews) {
      product.reviews = [];
    }

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    return res.status(201).json({
      message: "Review added",
      reviews: product.reviews,
      rating: product.rating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    console.error("Failed to add review", error);
    return res.status(500).json({ message: "Failed to add review", error: error.message });
  }
}

