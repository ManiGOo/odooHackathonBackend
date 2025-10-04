import {
  createApprovalInstance,
  getPendingApprovalsByUser,
  updateApprovalInstance,
  getApprovalInstancesByExpense,
  overrideAllPendingInstances,
} from "../models/approvalInstanceModel.js";
import { updateExpenseStatus } from "../models/expenseModel.js";

/**
 * Fetch all pending approvals for logged-in user
 */
export const getPendingApprovals = async (req, res) => {
  try {
    const approvals = await getPendingApprovalsByUser(req.user.id);
    res.json(approvals);
  } catch (err) {
    console.error("Failed to fetch pending approvals:", err);
    res.status(500).json({ error: "Could not fetch pending approvals" });
  }
};

/**
 * Act on a specific approval (approve/reject)
 */
export const actOnApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comment } = req.body;

    const instance = await updateApprovalInstance({
      id,
      status: action,
      comment,
      acted_at: new Date(),
    });

    res.json(instance);
  } catch (err) {
    console.error("Approval action failed:", err);
    res.status(500).json({ error: "Approval action failed" });
  }
};

/**
 * Admin override: approves all pending approvals for an expense
 */
export const overrideApproval = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id: expense_id } = req.params;

    // Check if there are any approval instances
    const instances = await getApprovalInstancesByExpense(expense_id);
    if (!instances.length) {
      return res.status(404).json({ error: "No approvals found for this expense" });
    }

    // Override all pending instances
    const updatedInstances = await overrideAllPendingInstances(expense_id);

    // Update expense status
    await updateExpenseStatus(expense_id, "Approved");

    res.json({ success: true, updatedInstances });
  } catch (err) {
    console.error("Admin override failed:", err);
    res.status(500).json({ error: "Override failed" });
  }
};
