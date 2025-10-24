import { Favorite } from '../models/Favorite.js';

export async function toggleFavorite(req, res) {
  const { property_id } = req.body;
  const r = await Favorite.toggle(req.session.user.id, property_id);
  res.json(r);
}
export async function listFavorites(req, res) {
  const rows = await Favorite.list(req.session.user.id);
  res.json({ favorites: rows });
}
