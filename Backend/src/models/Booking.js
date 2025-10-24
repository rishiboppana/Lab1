import { pool } from '../config/db.js';

export const Booking = {
  async create(b) {
    const [r] = await pool.query(
      `INSERT INTO bookings (traveler_id, property_id, start_date, end_date, guests, status)
       VALUES (?,?,?,?,?, 'PENDING')`,
      [b.traveler_id, b.property_id, b.start_date, b.end_date, b.guests]
    );
    return this.getById(r.insertId);
  },
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id=?', [id]);
    return rows[0];
  },
  async setStatus(id, status) {
    await pool.query('UPDATE bookings SET status=? WHERE id=?', [status, id]);
    return this.getById(id);
  },
  async forTraveler(traveler_id) {
    const [rows] = await pool.query(
      `SELECT b.*, p.title, p.location FROM bookings b
       JOIN properties p ON p.id=b.property_id
       WHERE traveler_id=? ORDER BY b.created_at DESC`,
      [traveler_id]
    );
    return rows;
  },
  async forOwner(owner_id) {
    const [rows] = await pool.query(
      `SELECT b.*, p.title, p.location FROM bookings b
       JOIN properties p ON p.id=b.property_id
       WHERE p.owner_id=? ORDER BY b.created_at DESC`,
      [owner_id]
    );
    return rows;
  },
  async forProperty(property_id) {
    const [rows] = await pool.query(
      `SELECT start_date, end_date, status FROM bookings
       WHERE property_id=? AND status IN ('PENDING','ACCEPTED')`,
      [property_id]
    );
    return rows;
  }
};
