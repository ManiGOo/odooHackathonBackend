import pool from "../config/db.js";

export const createOrganization = async ({ name, country_code, currency }) => {
  const result = await pool.query(
    `INSERT INTO organizations (name, country_code, currency)
     VALUES ($1, $2, $3) RETURNING *`,
    [name, country_code, currency]
  );
  return result.rows[0];
};

export const getOrganizationById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM organizations WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};
