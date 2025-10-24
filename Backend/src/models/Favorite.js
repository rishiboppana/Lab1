import { pool } from '../config/db.js';

export const Favorite = {
  async toggle(traveler_id, property_id) {
    const [rows] = await pool.query(
      'SELECT 1 FROM favorites WHERE traveler_id=? AND property_id=?',
      [traveler_id, property_id]
    );
    if (rows.length) {
      await pool.query('DELETE FROM favorites WHERE traveler_id=? AND property_id=?', [traveler_id, property_id]);
      return { favorited: false };
    } else {
      await pool.query('INSERT INTO favorites (traveler_id, property_id) VALUES (?,?)', [traveler_id, property_id]);
      return { favorited: true };
    }
  },
  async list(traveler_id) {
    const [rows] = await pool.query(
      `SELECT p.* FROM favorites f
       JOIN properties p ON p.id=f.property_id
       WHERE f.traveler_id=?`,
      [traveler_id]
    );
    return rows;
  }
};
