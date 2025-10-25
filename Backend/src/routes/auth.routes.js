import { Router } from 'express';
import { signup, login, me, logout } from '../controllers/auth.controller.js';
const r = Router();
import db from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

r.post('/signup', signup);
r.post('/login', login);
r.get('/me', me);
r.post('/logout', logout);
r.post("/become-host", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error: "Not logged in" });

    // update role in DB
    await db.query("UPDATE users SET role = 'owner' WHERE id = ?", [userId]);

    // update role in current session
    req.session.user.role = "owner";

    res.json({ message: "You're now a host!", user: req.session.user });
  } catch (err) {
    console.error("Error promoting user to host:", err);
    res.status(500).json({ error: "Failed to become host" });
  }
});

export default r;
