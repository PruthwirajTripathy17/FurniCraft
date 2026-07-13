import express from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import blogRoutes from "./blogRoutes.js";
import testimonialRoutes from "./testimonialRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import orderRoutes from "./orderRoutes.js";
import notificationRoutes from "./notificationRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/blogs", blogRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/payment", paymentRoutes);
router.use("/orders", orderRoutes);
router.use("/notifications", notificationRoutes);

export default router;
