import pool from "../config/db.js";

export const createApprovalInstance = async ({
  expense_id,
  approver_id,
  step_order,
}) => {
  const result = await pool.query(
    `INSERT INTO approval_instances (expense_id, approver_id, step_order)
     VALUES ($1,$2,$3) RETURNING *`,
    [expense_id, approver_id, step_order]
  );
  return result.rows[0];
};

export const updateApprovalInstance = async ({ id, status, comment, acted_at }) => {
  const result = await pool.query(
    `UPDATE approval_instances
     SET status = $1, comment = $2, acted_at = $3
     WHERE id = $4 RETURNING *`,
    [status, comment, acted_at, id]
  );
  return result.rows[0];
};

export const getPendingApprovalsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM approval_instances
     WHERE approver_id = $1 AND status = 'Pending'`,
    [userId]
  );
  return result.rows;
};

// New: get all instances for an expense
export const getApprovalInstancesByExpense = async (expense_id) => {
  const result = await pool.query(
    `SELECT * FROM approval_instances WHERE expense_id = $1 ORDER BY step_order ASC`,
    [expense_id]
  );
  return result.rows;
};

// Optional: mark all pending instances as overridden
export const overrideAllPendingInstances = async (expense_id) => {
  const result = await pool.query(
    `UPDATE approval_instances
     SET status = 'Approved', comment = 'Overridden by admin', acted_at = NOW()
     WHERE expense_id = $1 AND status = 'Pending'
     RETURNING *`,
    [expense_id]
  );
  return result.rows;
};
