import express from "express";
import multer from "multer";
import { uploadReceipts } from "../controllers/ocrController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Only employees can upload receipts
router.post(
  "/upload",
  authMiddleware,
  requireRole("employee"),
  upload.array("receipts"), // multi-file
  uploadReceipts
);

export default router;
