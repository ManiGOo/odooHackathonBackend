import bcrypt from "bcrypt";
import {
  createUser,
  getUserById,
  fetchAllUsers,
  updateUserRoleById,
  getUserByEmail,
} from "../models/userModel.js";

// Add a new user (Admins only)
export const addUser = async (req, res) => {
  try {
    const { org_id, role: currentUserRole } = req.user;
    if (currentUserRole.toLowerCase() !== "admin") {
      return res.status(403).json({ error: "Only admins can add users" });
    }

    const { email, password, name, role, manager_id } = req.body;

    // Check if email already exists
    const existing = await getUserByEmail(email);
    if (existing) return res.status(400).json({ error: "User already exists" });

    const password_hash = await bcrypt.hash(password, 10);

    const user = await createUser({
      org_id,
      email,
      password_hash,
      name,
      role,
      manager_id,
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Add user failed" });
  }
};

// Get current logged-in user profile
export const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch profile" });
  }
};

// Fetch all users in the org (Admins only)
export const getAllUsers = async (req, res) => {
  try {
    const { org_id, role: currentUserRole } = req.user;
    if (currentUserRole.toLowerCase() !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const users = await fetchAllUsers(org_id);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch users" });
  }
};

// Update user role (Admins only)
export const changeUserRole = async (req, res) => {
  try {
    const { role: currentUserRole } = req.user;
    if (currentUserRole.toLowerCase() !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;
    const { role } = req.body;

    const updatedUser = await updateUserRoleById(id, role);
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update role" });
  }
};
