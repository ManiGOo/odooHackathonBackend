import { createExpense, getExpensesByUser, getExpensesByOrg, getAllExpenses as getAllExpensesModel } from "../models/expenseModel.js";
import { createExpenseItem } from "../models/expenseItemModel.js";
import { processReceipt } from "../services/ocrService.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Submit expense: supports manual submission or OCR upload
 */
export const submitExpense = async (req, res, next) => {
  try {
    const { org_id, id: requester_id, org_currency } = req.user;
    const { items, title, category, description } = req.body;

    const createdExpenses = [];

    // 1️⃣ OCR receipt upload (optional)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(file.buffer);
        });

        // Parse receipt via OCR
        const parsed = await processReceipt(file.buffer, org_currency, org_currency);

        // Ensure safe values
        const safeParsed = {
          amount: parseFloat(parsed.amount) || 0,
          original_amount: parseFloat(parsed.original_amount) || 0,
          original_currency: parsed.original_currency || org_currency,
          exchange_rate: parsed.exchange_rate || 1,
          raw_text: parsed.raw_text || "",
        };

        // Create main expense
        const expense = await createExpense({
          org_id,
          requester_id,
          title: title || "Receipt Upload",
          total_amount: safeParsed.amount,
          original_amount: safeParsed.original_amount,
          original_currency: safeParsed.original_currency,
          exchange_rate: safeParsed.exchange_rate,
          currency: org_currency, // always set
          status: "Submitted",
          category: category || "Misc",
          description: description || safeParsed.raw_text,
          submitted_at: new Date(),
        });

        // Create expense item
        await createExpenseItem({
          expense_id: expense.id,
          description: description || safeParsed.raw_text,
          amount: safeParsed.amount,
          original_amount: safeParsed.original_amount,
          original_currency: safeParsed.original_currency,
          exchange_rate: safeParsed.exchange_rate,
          expense_date: new Date(),
          receipt_url: uploadResult.secure_url,
        });

        createdExpenses.push(expense);
      }
    }
    // 2️⃣ Manual items submission
    else if (Array.isArray(items) && items.length > 0) {
      const safeItems = items.map(i => ({
        description: i.description || "No description",
        amount: parseFloat(i.amount) || 0,
        original_amount: parseFloat(i.original_amount) || parseFloat(i.amount) || 0,
        original_currency: i.currency || org_currency,
        exchange_rate: i.exchange_rate || 1,
      }));

      const totalAmount = safeItems.reduce((sum, i) => sum + i.amount, 0);
      const totalOriginalAmount = safeItems.reduce((sum, i) => sum + i.original_amount, 0);

      const expense = await createExpense({
        org_id,
        requester_id,
        title: title || "Manual Expense",
        total_amount: totalAmount,
        original_amount: totalOriginalAmount,
        original_currency: safeItems[0].original_currency,
        exchange_rate: safeItems[0].exchange_rate,
        currency: org_currency,
        status: "Submitted",
        category: category || "Misc",
        description: description || "Manual items",
        submitted_at: new Date(),
      });

      for (const item of safeItems) {
        await createExpenseItem({
          expense_id: expense.id,
          description: item.description,
          amount: item.amount,
          original_amount: item.original_amount,
          original_currency: item.original_currency,
          exchange_rate: item.exchange_rate,
          expense_date: new Date(),
        });
      }

      createdExpenses.push(expense);
    } 
    // 3️⃣ Neither OCR nor manual items
    else {
      return res.status(400).json({ error: "No receipts or items provided" });
    }

    res.json({ success: true, expenses: createdExpenses });
  } catch (err) {
    console.error("Expense submission failed:", err);
    next(err);
  }
};

/**
 * Fetch expenses for logged-in user
 */
export const myExpenses = async (req, res, next) => {
  try {
    const expenses = await getExpensesByUser(req.user.id);
    res.json(expenses);
  } catch (err) {
    console.error("Failed to fetch user expenses:", err);
    next(err);
  }
};

/**
 * Fetch all team expenses (manager/admin)
 */
export const teamExpenses = async (req, res, next) => {
  try {
    const { org_id } = req.user;
    const expenses = await getExpensesByOrg(org_id);
    res.json(expenses);
  } catch (err) {
    console.error("Failed to fetch team expenses:", err);
    next(err);
  }
};

/**
 * Fetch all expenses (admin only)
 */
export const getAllExpenses = async (req, res, next) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const expenses = await getAllExpensesModel();
    res.json(expenses);
  } catch (err) {
    console.error("Failed to fetch all expenses:", err);
    next(err);
  }
};
