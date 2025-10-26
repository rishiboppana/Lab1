import express from "express";
import db from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* ================================
   ✅ Traveler — Create new booking
   ================================ */
router.post("/", async (req, res) => {
  const { property_id, user_id, check_in, check_out, total_price, guests = 1 } = req.body;

  if (!property_id || !user_id || !check_in || !check_out)
    return res.status(400).json({ error: "Missing booking fields" });

  // Prevent overlapping Accepted or Pending bookings
// Prevent overlapping bookings (only consider Pending or Accepted)
const [existing] = await db.query(
  `SELECT * FROM bookings
   WHERE property_id = ?
     AND status IN ('Pending', 'Accepted')
     AND NOT (check_out <= ? OR check_in >= ?)`,
  [property_id, check_in, check_out]
);

if (existing.length > 0)
  return res.status(409).json({ error: "Dates already booked" });


  await db.query(
    `INSERT INTO bookings
      (property_id, user_id, check_in, check_out, total_price, guests, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
    [property_id, user_id, check_in, check_out, total_price, guests]
  );
  res.json({ message: "Booking created successfully (Pending)" });
});

/* ================================
   ✅ Traveler — View bookings
   ================================ */
router.get("/user/:userId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, p.title, p.location, p.images
         FROM bookings b
         JOIN properties p ON b.property_id = p.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC`,
      [req.params.userId]
    );
    res.json({ bookings: rows });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ error: "Failed to load bookings" });
  }
});

/* =========================================
   ✅ Owner — View incoming booking requests
   ========================================= */
router.get("/owner", requireAuth, async (req, res) => {
  try {
    const ownerId = req.session.user?.id;
    if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

    const [rows] = await db.query(
      `
      SELECT 
        b.id, b.property_id, b.user_id, b.check_in, b.check_out,
        b.total_price, b.status, b.created_at,
        p.title, p.location, p.images,
        u.name AS traveler_name, u.email AS traveler_email
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      JOIN users u ON u.id = b.user_id
      WHERE p.owner_id = ?
      ORDER BY 
        FIELD(b.status, 'Pending','Accepted','Cancelled'),
        b.created_at DESC
      `,
      [ownerId]
    );

    res.json({ bookings: rows });
  } catch (err) {
    console.error("Error fetching owner bookings:", err);
    res.status(500).json({ error: "Failed to load owner bookings" });
  }
});

router.patch("/:id/accept", async (req, res) => {
  await db.query("UPDATE bookings SET status='Accepted' WHERE id=?", [req.params.id]);
  res.json({ message: "Booking accepted" });
});

// PATCH cancel
router.patch("/:id/cancel", async (req, res) => {
  await db.query("UPDATE bookings SET status='Cancelled' WHERE id=?", [req.params.id]);
  res.json({ message: "Booking cancelled" });
});


router.get("/owner/:ownerId", async (req, res) => {
  const [rows] = await db.query(
    `SELECT b.*, u.name AS guest_name, u.email AS guest_email, p.title
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       JOIN users u ON b.user_id = u.id
      WHERE p.owner_id = ?
      ORDER BY b.created_at DESC`,
    [req.params.ownerId]
  );
  res.json({ bookings: rows });
});

export default router;
