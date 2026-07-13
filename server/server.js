import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";
import allRoutes from "./routes/allRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:5174",
      ].filter(Boolean);

      if (!origin) return cb(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");
      const normalizedAllowed = allowed.map((url) => url.replace(/\/$/, ""));

      if (normalizedAllowed.includes(normalizedOrigin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Furniture API is running" });
});

app.use("/api", allRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
