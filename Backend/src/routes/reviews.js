import express from "express";
import db from "../config/db.js";
const router = express.Router();

// GET all reviews for a property
router.get("/:propertyId", async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.*, u.name AS user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
      WHERE r.property_id = ? 
      ORDER BY r.created_at DESC`,
    [req.params.propertyId]
  );
  res.json({ reviews: rows });
});

// POST a new review
router.post("/", async (req, res) => {
  const { property_id, user_id, rating, comment } = req.body;
  if (!rating || !property_id || !user_id)
    return res.status(400).json({ error: "Missing fields" });
  await db.query(
    "INSERT INTO reviews (property_id, user_id, rating, comment) VALUES (?,?,?,?)",
    [property_id, user_id, rating, comment]
  );
  res.json({ message: "Review added" });
});

// DELETE (review owner or admin)
router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM reviews WHERE id=?", [req.params.id]);
  res.json({ message: "Deleted" });
});

export default router;
