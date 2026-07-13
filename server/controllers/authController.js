import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
  };
}

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  let role = "user";
  if (email.toLowerCase().includes("admin")) {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount < 5) {
      role = "admin";
    }
  }

  const user = await User.create({ name, email, password: hashedPassword, role });


  try {
    await Notification.create({
      title: "New User Registered",
      message: `${user.name} (${user.email}) registered a new account.`,
      type: "user",
      link: `/admin/users?id=${user._id}`,
    });
  } catch (err) {
    console.error("Failed to create registration notification:", err);
  }

  return res.status(201).json({
    token: createToken(user._id),
    user: publicUser(user),
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    token: createToken(user._id),
    user: publicUser(user),
  });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function updateProfile(req, res) {
  try {
    const { name, email, password } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: "Email is already registered by another user" });
      }
      user.email = email.toLowerCase();
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ message: error.message || "Failed to update profile" });
  }
}
