import jwt from "jsonwebtoken";
import { getUserById } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB to attach details
    const user = await getUserById(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // attach full user object
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid token" });
  }
};
