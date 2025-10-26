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

// Get user's trip history (all their bookings)
router.get("/my-trips", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const [trips] = await db.query(
      `SELECT 
        b.id,
        b.check_in,
        b.check_out,
        b.total_price,
        b.status,
        b.created_at,
        p.id as property_id,
        p.title,
        p.location,
        p.type,
        p.images,
        p.price_per_night,
        u.name as owner_name,
        u.email as owner_email
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       JOIN users u ON p.owner_id = u.id
       WHERE b.user_id = ?
       ORDER BY b.check_in DESC`,
      [userId]
    );

    console.log(`📅 Found ${trips.length} trips for user ${userId}`);
    res.json({ trips });
  } catch (err) {
    console.error("Error fetching user trips:", err);
    res.status(500).json({ error: "Failed to fetch trip history" });
  }
});

// Cancel a booking (traveler can cancel their own booking)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.session.user.id;

    // Check if booking belongs to user
    const [booking] = await db.query(
      "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
      [bookingId, userId]
    );

    if (!booking.length) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Only allow canceling Pending or Accepted bookings
    if (booking[0].status === "Cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    // Update status to Cancelled
    await db.query(
      "UPDATE bookings SET status = 'Cancelled' WHERE id = ?",
      [bookingId]
    );

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

/* ================================
   🤖 NEW: AI Concierge — Get upcoming bookings
   For AI itinerary generation
   ================================ */
router.get("/upcoming/:userId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        b.id,
        b.property_id,
        b.user_id,
        b.check_in,
        b.check_out,
        b.guests,
        b.total_price,
        b.status,
        b.created_at,
        p.title as property_title,
        p.location,
        p.type,
        p.amenities,
        p.images,
        p.price_per_night,
        p.bedrooms,
        p.bathrooms
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.user_id = ?
        AND b.status IN ('Pending', 'Accepted')
        AND b.check_in >= CURDATE()
      ORDER BY b.check_in ASC`,
      [req.params.userId]
    );

    // Format the response for AI Concierge
    const formattedBookings = rows.map(booking => ({
      id: booking.id,
      property_id: booking.property_id,
      user_id: booking.user_id,
      check_in: booking.check_in,
      check_out: booking.check_out,
      guests: booking.guests,
      total_price: booking.total_price,
      status: booking.status,
      property_title: booking.property_title,
      title: booking.property_title, // Alias for compatibility
      location: booking.location,
      type: booking.type,
      price_per_night: booking.price_per_night,
      bedrooms: booking.bedrooms,
      bathrooms: booking.bathrooms,
      amenities: booking.amenities,
      images: booking.images
    }));

    res.json(formattedBookings);
  } catch (err) {
    console.error("Error fetching upcoming bookings:", err);
    res.status(500).json({ error: "Failed to fetch upcoming bookings" });
  }
});

/* ================================
   🤖 NEW: AI Concierge — Get specific booking details
   ================================ */
router.get("/details/:bookingId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        b.*,
        p.title as property_title,
        p.location,
        p.type,
        p.amenities,
        u.name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?`,
      [req.params.bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching booking details:", err);
    res.status(500).json({ error: "Failed to fetch booking details" });
  }
});

export default router;