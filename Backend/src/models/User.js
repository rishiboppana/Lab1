import { pool } from '../config/db.js';

export const User = {
  async create(u) {
    const [r] = await pool.query(
      `INSERT INTO users (role,name,email,password_hash,phone,about,city,country,languages,gender,avatar_url)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [u.role, u.name, u.email, u.password_hash, u.phone||null, u.about||null, u.city||null, u.country||null, u.languages||null, u.gender||null, u.avatar_url||null]
    );
    return { id: r.insertId, ...u };
  },
  async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email=? LIMIT 1", [email]);
    return rows[0];
  },
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id=? LIMIT 1', [id]);
    return rows[0];
  },
  async update(id, patch) {
    const fields = ['name','email','phone','about','city','country','languages','gender','avatar_url'];
    const sets = [], vals = [];
    for (const f of fields) if (f in patch) { sets.push(`${f}=?`); vals.push(patch[f]); }
    if (!sets.length) return this.findById(id);
    vals.push(id);
    await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id=?`, vals);
    return this.findById(id);
  }
};
