import express from "express";
import db from "../config/db.js";
const router = express.Router();

// ✅ Create new booking
router.post("/", async (req, res) => {
  const { property_id, user_id, check_in, check_out, total_price } = req.body;

  if (!property_id || !user_id || !check_in || !check_out)
    return res.status(400).json({ error: "Missing booking fields" });

  // Prevent overlapping bookings
  const [existing] = await db.query(
    `SELECT * FROM bookings
     WHERE property_id = ?
     AND NOT (check_out <= ? OR check_in >= ?)`,
    [property_id, check_in, check_out]
  );
  if (existing.length > 0)
    return res.status(409).json({ error: "Dates already booked" });

  await db.query(
    "INSERT INTO bookings (property_id, user_id, check_in, check_out, total_price) VALUES (?,?,?,?,?)",
    [property_id, user_id, check_in, check_out, total_price]
  );
  res.json({ message: "Booking created successfully" });
});

// ✅ Get bookings for a user
router.get("/user/:userId", async (req, res) => {
  const [rows] = await db.query(
    `SELECT b.*, p.title, p.location, p.images
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC`,
    [req.params.userId]
  );
  res.json({ bookings: rows });
});

export default router;
