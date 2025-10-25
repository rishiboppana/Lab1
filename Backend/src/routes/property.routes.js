import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireOwner } from '../middleware/auth.js';
import {
  createProperty,
  updateProperty,
  removeProperty,
  getOne,
  search,
  ownerList
} from '../controllers/property.controller.js';
import db from "../config/db.js"

const r = Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'src/uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// public search + single view
r.get("/search", async (req, res) => {
  const { location } = req.query;

  let sql = `
    SELECT p.*,
           ROUND(AVG(r.rating),1) AS avg_rating,
           COUNT(r.id) AS review_count
      FROM properties p
      LEFT JOIN reviews r ON p.id = r.property_id
  `;

  const params = [];

  if (location) {
    sql += " WHERE p.location LIKE ?";
    params.push(`%${location}%`);
  }

  sql += " GROUP BY p.id";

  const [rows] = await db.query(sql, params);
  res.json({ properties: rows });
});

r.get("/:id", async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.*,
           ROUND(AVG(r.rating),1) AS avg_rating,
           COUNT(r.id) AS review_count
      FROM properties p
      LEFT JOIN reviews r ON p.id = r.property_id
     WHERE p.id = ?
     GROUP BY p.id
  `, [req.params.id]);

  res.json({ property: rows[0] });
});

// owner-only CRUD
r.use(requireAuth, requireOwner);
r.post('/', upload.array('images', 5), createProperty);
r.put('/:id', upload.array('images', 5), updateProperty);
r.delete('/:id', removeProperty);
r.get('/owner/list', ownerList);

export default r;
