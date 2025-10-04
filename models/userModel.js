import pool from "../config/db.js";

export const createUser = async ({ org_id, email, password_hash, name, role, manager_id }) => {
  const result = await pool.query(
    `INSERT INTO users (org_id, email, password_hash, name, role, manager_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [org_id, email, password_hash, name, role, manager_id || null]
  );
  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

export const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

// Fetch all users in the org (including manager names)
export const fetchAllUsers = async (org_id) => {
  const res = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.manager_id, m.name AS manager_name
     FROM users u
     LEFT JOIN users m ON u.manager_id = m.id
     WHERE u.org_id = $1
     ORDER BY u.created_at ASC`,
    [org_id]
  );
  return res.rows;
};

// Update user role
export const updateUserRoleById = async (id, role) => {
  const res = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
    [role, id]
  );
  return res.rows[0];
};
