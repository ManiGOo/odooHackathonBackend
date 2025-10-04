import express from "express";
import { signup, login, me } from "../controllers/authController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import Joi from "joi";

const router = express.Router();

// Validation schemas
// Validation schemas
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  country_code: Joi.string().length(2).required(), // 2-letter ISO code
  currency: Joi.string().length(3).required(), // 3-letter currency code
  org_name: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Routes
router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware, me);

export default router;
