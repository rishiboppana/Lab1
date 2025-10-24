import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

export async function signup(req, res) {
  const { role, name, email, password } = req.body;
  if (!role || !name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const existing = await User.findByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ role, name, email, password_hash });
  req.session.user = { id: user.id, role: user.role, name: user.name };
  res.json({ user: req.session.user });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const u = await User.findByEmail(email);
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.user = { id: u.id, role: u.role, name: u.name };
  res.json({ user: req.session.user });
}

export async function me(req, res) {
  res.json({ user: req.session.user || null });
}

export async function logout(req, res) {
  req.session.destroy(() => res.json({ ok: true }));
}
