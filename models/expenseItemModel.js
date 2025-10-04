import pool from "../config/db.js";

export const createExpenseItem = async ({
  expense_id,
  description,
  amount,
  original_amount,
  original_currency,
  exchange_rate,
  expense_date,
  receipt_url,
}) => {
  const result = await pool.query(
    `INSERT INTO expense_items
    (expense_id, description, amount, original_amount, original_currency,
     exchange_rate, expense_date, receipt_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      expense_id,
      description,
      amount,
      original_amount,
      original_currency,
      exchange_rate,
      expense_date,
      receipt_url,
    ]
  );
  return result.rows[0];
};

export const getItemsByExpenseId = async (expenseId) => {
  const result = await pool.query(
    `SELECT * FROM expense_items WHERE expense_id = $1`,
    [expenseId]
  );
  return result.rows;
};
