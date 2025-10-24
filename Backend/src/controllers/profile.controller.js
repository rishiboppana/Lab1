import { User } from '../models/User.js';

export async function getProfile(req, res) {
  const user = await User.findById(req.session.user.id);
  res.json({ profile: user });
}

export async function updateProfile(req, res) {
  const updated = await User.update(req.session.user.id, req.body);
  res.json({ profile: updated });
}
