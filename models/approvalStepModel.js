import pool from "../config/db.js";

export const createApprovalStep = async ({
  rule_id,
  step_order,
  approver_type,
  role,
  user_id,
  is_manager_approver,
  percentage_required,
  specific_approver_id,
}) => {
  const result = await pool.query(
    `INSERT INTO approval_steps
    (rule_id, step_order, approver_type, role, user_id, is_manager_approver,
     percentage_required, specific_approver_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      rule_id,
      step_order,
      approver_type,
      role,
      user_id,
      is_manager_approver,
      percentage_required,
      specific_approver_id,
    ]
  );
  return result.rows[0];
};

export const getStepsByRuleId = async (ruleId) => {
  const result = await pool.query(
    `SELECT * FROM approval_steps WHERE rule_id = $1 ORDER BY step_order ASC`,
    [ruleId]
  );
  return result.rows;
};
