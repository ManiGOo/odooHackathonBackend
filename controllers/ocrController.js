import { processReceipt } from "../services/ocrService.js";
import { createExpense } from "../models/expenseModel.js";
import { createExpenseItem } from "../models/expenseItemModel.js";

export const uploadReceipts = async (req, res, next) => {
  try {
    const files = req.files;
    if (!files || !files.length) return res.status(400).json({ error: "No files uploaded" });

    const results = [];

    for (let file of files) {
      const parsed = await processReceipt(file.buffer, req.user.org_currency, req.body.original_currency);

      // Create expense
      const expense = await createExpense({
        org_id: req.user.org_id,
        requester_id: req.user.id,
        title: req.body.title || "Receipt Upload",
        total_amount: parsed.amount,
        original_amount: parsed.original_amount,
        original_currency: parsed.original_currency,
        exchange_rate: parsed.exchange_rate,
        currency: parsed.currency,
        status: "Submitted",
        category: req.body.category || "Misc",
        description: req.body.description || parsed.raw_text,
        submitted_at: new Date(),
      });

      // Create expense item
      await createExpenseItem({
        expense_id: expense.id,
        description: req.body.description || parsed.raw_text,
        amount: parsed.amount,
        original_amount: parsed.original_amount,
        original_currency: parsed.original_currency,
        exchange_rate: parsed.exchange_rate,
        expense_date: parsed.expense_date,
        receipt_url: req.body.receipt_url || null,
      });

      results.push(expense);
    }

    res.json({ success: true, expenses: results });
  } catch (err) {
    next(err);
  }
};
