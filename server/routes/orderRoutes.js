import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Customer specific order endpoints
router.post("/", auth, createOrder);
router.get("/my-orders", auth, getMyOrders);
router.get("/:id", auth, getOrderById);

// Admin specific order endpoints
router.get("/", auth, getAllOrders);
router.put("/:id/status", auth, updateOrderStatus);

export default router;
