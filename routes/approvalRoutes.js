import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getPendingApprovals,
  actOnApproval,
  overrideApproval,
} from "../controllers/approvalController.js";

import { getApprovalInstancesByExpense } from "../models/approvalInstanceModel.js"; // ✅ Import model function directly

const router = express.Router();

// -------------------- Regular Endpoints --------------------

// Fetch pending approvals for logged-in user
router.get("/pending", authMiddleware, getPendingApprovals);

// Act on a specific approval (approve/reject)
router.post("/:id/action", authMiddleware, actOnApproval);

// Admin override endpoint: approve all pending approvals for an expense
router.post("/:id/override", authMiddleware, overrideApproval);

// Fetch all approval instances for a specific expense
router.get("/expense/:id", authMiddleware, async (req, res) => {
  try {
    const { id: expenseId } = req.params;

    // Fetch approval instances for this expense
    const instances = await getApprovalInstancesByExpense(expenseId);

    if (!instances.length) {
      return res.status(404).json({ error: "No approvals found for this expense" });
    }

    res.json(instances);
  } catch (err) {
    console.error("Failed to fetch approval instances:", err);
    res.status(500).json({ error: "Failed to fetch approval instances" });
  }
});

export default router;
