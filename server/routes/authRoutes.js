import express from "express";
import { login, me, register, updateProfile } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);
router.put("/profile", auth, updateProfile);

export default router;
