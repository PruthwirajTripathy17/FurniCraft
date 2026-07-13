import express from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  getProductById,
  updateProduct,
  uploadProductImage,
  addProductReview,
} from "../controllers/productController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.post("/upload", uploadProductImage);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/reviews", auth, addProductReview);

export default router;

