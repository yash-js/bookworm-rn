import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./route/authRoutes.js";
import bookRoutes from "./route/bookRoutes.js";
import { connectDb } from "./lib/db.js";

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port} 🔥`);
  connectDb();
});
