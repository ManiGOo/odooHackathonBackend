import express from "express";
import multer from "multer";
import { submitExpense, myExpenses, teamExpenses, getAllExpenses } from "../controllers/expenseController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST multiple receipts (multi-part form data: "receipts")
router.post("/", authMiddleware, upload.array("receipts", 10), submitExpense);
router.get("/mine", authMiddleware, myExpenses);
router.get("/team", authMiddleware, teamExpenses);
// Admin: fetch all expenses
router.get("/", authMiddleware, getAllExpenses);


export default router;
