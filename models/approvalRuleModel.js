import pool from "../config/db.js";

export const createApprovalRule = async ({ org_id, name, description }) => {
  const result = await pool.query(
    `INSERT INTO approval_rules (org_id, name, description)
     VALUES ($1,$2,$3) RETURNING *`,
    [org_id, name, description]
  );
  return result.rows[0];
};

export const getRulesByOrg = async (orgId) => {
  const result = await pool.query(
    `SELECT * FROM approval_rules WHERE org_id = $1`,
    [orgId]
  );
  return result.rows;
};
