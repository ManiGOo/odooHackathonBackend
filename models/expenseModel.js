import pool from "../config/db.js";

/**
 * Create a new expense.
 * OCR items are optional. Safe defaults applied for currency & amounts.
 */
export const createExpense = async (data) => {
  const {
    org_id,
    requester_id,
    title,
    total_amount,
    original_amount,
    original_currency,
    exchange_rate,
    currency,
    status,
    category,
    description,
    submitted_at,
    items, // optional array of expense items from OCR/manual input
  } = data;

  // 1️⃣ Ensure currency values are never null
  const expenseCurrency = currency || original_currency || "USD";

  // 2️⃣ Calculate total_amount if missing and items exist
  let total = total_amount;
  let originalTotal = original_amount;

  if ((!total || !originalTotal) && Array.isArray(items) && items.length) {
    total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    originalTotal = items.reduce(
      (sum, item) => sum + (parseFloat(item.original_amount) || 0),
      0
    );
  }

  // 3️⃣ Ensure exchange_rate is set
  const rate = exchange_rate || 1;

  // 4️⃣ Insert into DB
  const result = await pool.query(
    `INSERT INTO expenses
    (org_id, requester_id, title, total_amount, original_amount, original_currency, exchange_rate,
     currency, status, category, description, submitted_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      org_id,
      requester_id,
      title,
      total || 0,
      originalTotal || 0,
      original_currency || expenseCurrency,
      rate,
      expenseCurrency,
      status || "Draft",
      category || null,
      description || null,
      submitted_at || new Date(),
    ]
  );

  const createdExpense = result.rows[0];

  // 5️⃣ Optional: insert items if provided
  if (Array.isArray(items) && items.length) {
    for (const item of items) {
      await pool.query(
        `INSERT INTO expense_items
        (expense_id, description, amount, original_amount, currency, exchange_rate)
        VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          createdExpense.id,
          item.description || "No description",
          parseFloat(item.amount) || 0,
          parseFloat(item.original_amount) || 0,
          item.currency || expenseCurrency,
          item.exchange_rate || rate,
        ]
      );
    }
  }

  return createdExpense;
};

// Fetch expense by ID
export const getExpenseById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM expenses WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

// Fetch expenses by user
export const getExpensesByUser = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM expenses WHERE requester_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

// Fetch all expenses in an organization (for managers/admin)
export const getExpensesByOrg = async (orgId) => {
  const result = await pool.query(
    `SELECT * FROM expenses WHERE org_id = $1 ORDER BY submitted_at DESC`,
    [orgId]
  );
  return result.rows;
};

// Fetch all expenses across all organizations (admin only)
export const getAllExpenses = async () => {
  const result = await pool.query(
    `SELECT * FROM expenses ORDER BY submitted_at DESC`
  );
  return result.rows;
};
export const updateExpenseStatus = async (expense_id, status) => {
  const result = await pool.query(
    `UPDATE expenses SET status = $1 WHERE id = $2 RETURNING *`,
    [status, expense_id]
  );
  return result.rows[0];
};

