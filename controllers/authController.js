import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createOrganization } from "../models/organizationModel.js";
import { createUser, getUserByEmail } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const signup = async (req, res) => {
  try {
    const { email, password, name, country_code, currency, org_name } = req.body;

    // check if user already exists
    const existing = await getUserByEmail(email);
    if (existing) return res.status(400).json({ error: "User already exists" });

    // create org
    const org = await createOrganization({
      name: org_name || `${name}'s Company`,
      country_code,
      currency,
    });

    // hash password
    const password_hash = await bcrypt.hash(password, 10);

    // create user as admin
    const user = await createUser({
      org_id: org.id,
      email,
      password_hash,
      name,
      role: "admin",
    });

    const token = jwt.sign({ id: user.id, org_id: org.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user, org });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, org_id: user.org_id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

// Return currently logged-in user
export const me = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(req.user); // req.user set by authMiddleware
};
