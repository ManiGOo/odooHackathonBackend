import express from "express";
import {
  addUser,
  getProfile,
  getAllUsers,
  changeUserRole,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/", authMiddleware, addUser); // Add new user
router.get("/me", authMiddleware, getProfile); // Current user profile
router.get("/", authMiddleware, getAllUsers); // Fetch all users (admin)
router.put("/:id/role", authMiddleware, changeUserRole); // Update role

export default router;
