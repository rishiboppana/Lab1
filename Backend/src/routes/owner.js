import express from "express";
import db from "../config/db.js";
const router = express.Router();

router.get("/properties/:ownerId", async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.*,
            CAST(ROUND(AVG(r.rating),1) AS DECIMAL(2,1)) AS avg_rating,
            COUNT(r.id) AS review_count
       FROM properties p
  LEFT JOIN reviews r ON p.id = r.property_id
      WHERE p.owner_id = ?
   GROUP BY p.id
   ORDER BY p.created_at DESC`,
    [req.params.ownerId]
  );
  res.json({ properties: rows });
});

router.get("/bookings/:ownerId", async (req, res) => {
  const [rows] = await db.query(
    `SELECT b.*, u.name AS guest_name, p.title, p.location
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       JOIN users u ON b.user_id = u.id
      WHERE p.owner_id = ?
   ORDER BY b.created_at DESC`,
    [req.params.ownerId]
  );
  res.json({ bookings: rows });
});


router.delete("/property/:id", async (req, res) => {
  await db.query("DELETE FROM properties WHERE id = ?", [req.params.id]);
  res.json({ message: "Property deleted" });
});

export default router;
