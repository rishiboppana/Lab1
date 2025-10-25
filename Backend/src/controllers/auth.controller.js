// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export async function signup(req, res) {
  try {
    const { role = "traveler", name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing required fields" });

    const existing = await User.findByEmail(email);
    if (existing)
      return res.status(409).json({ error: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ role, name, email, password_hash });

    // store minimal safe info in session
    req.session.user = { id: user.id, role: user.role, name: user.name };

    return res.status(201).json({ user: req.session.user });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Signup failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Missing credentials" });

    const u = await User.findByEmail(email);
    if (!u) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    req.session.user = { id: u.id, role: u.role, name: u.name };
    console.log("Session created for:", req.session.user);
    return res.json({ user: req.session.user });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
}

export async function me(req, res) {
  return res.json({ user: req.session.user || null });
}

export async function logout(req, res) {
  req.session.destroy(() => res.json({ ok: true }));
}
