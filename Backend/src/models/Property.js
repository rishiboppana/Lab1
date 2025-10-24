import { pool } from '../config/db.js';

export const Property = {
  async create(owner_id, p) {
    const [r] = await pool.query(
      `INSERT INTO properties
       (owner_id, title, type, location, description, price_per_night, bedrooms, bathrooms, amenities, images)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [owner_id, p.title, p.type||null, p.location||'', p.description||'', p.price_per_night||0, p.bedrooms||0, p.bathrooms||0, JSON.stringify(p.amenities||[]), JSON.stringify(p.images||[])]
    );
    return { id: r.insertId, owner_id, ...p };
  },
  async update(id, owner_id, p) {
    const [rows] = await pool.query('SELECT owner_id FROM properties WHERE id=?', [id]);
    if (!rows[0] || rows[0].owner_id !== owner_id) return null;
    await pool.query(
      `UPDATE properties SET title=?, type=?, location=?, description=?, price_per_night=?, bedrooms=?, bathrooms=?, amenities=?, images=? WHERE id=?`,
      [p.title, p.type, p.location, p.description, p.price_per_night, p.bedrooms, p.bathrooms, JSON.stringify(p.amenities||[]), JSON.stringify(p.images||[]), id]
    );
    return this.getById(id);
  },
  async remove(id, owner_id) {
    const [rows] = await pool.query('SELECT owner_id FROM properties WHERE id=?', [id]);
    if (!rows[0] || rows[0].owner_id !== owner_id) return null;
    await pool.query('DELETE FROM properties WHERE id=?', [id]);
    return { ok: true };
  },
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM properties WHERE id=?', [id]);
    return rows[0];
  },
  async search({ location, minPrice, maxPrice, guests, startDate, endDate, page=1, limit=12 }) {
    // Basic search + price filter; availability handled in controller
    const params = [];
    let where = 'WHERE 1=1';
    if (location) { where += ' AND location LIKE ?'; params.push(`%${location}%`); }
    if (minPrice) { where += ' AND price_per_night >= ?'; params.push(+minPrice); }
    if (maxPrice) { where += ' AND price_per_night <= ?'; params.push(+maxPrice); }
    const offset = (page-1) * limit;

    const [rows] = await pool.query(
      `SELECT * FROM properties ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, +limit, +offset]
    );
    return rows;
  },
  async ownerList(owner_id) {
    const [rows] = await pool.query('SELECT * FROM properties WHERE owner_id=? ORDER BY id DESC', [owner_id]);
    return rows;
  }
};
