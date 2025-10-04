import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import approvalRoutes from "./routes/approvalRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/approvals", approvalRoutes);

// 404 fallback (optional)
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
