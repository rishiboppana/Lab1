import express from "express";
import db from "../config/db.js";
const router = express.Router();
router.get("/properties/:ownerId", async (req, res) => {
  try {
    console.log("=" .repeat(50));
    console.log("🏠 GET /owner/properties/:ownerId called");
    console.log("📝 ownerId from params:", req.params.ownerId);
    console.log("=" .repeat(50));

    const [rows] = await db.query(
      `
      SELECT p.*,
             CAST(ROUND(AVG(r.rating),1) AS DECIMAL(2,1)) AS avg_rating,
             COUNT(r.id) AS review_count
        FROM properties p
        LEFT JOIN reviews r ON p.id = r.property_id
       WHERE p.owner_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC
      `,
      [req.params.ownerId]
    );

    console.log("✅ Found", rows.length, "properties");
    res.json({ properties: rows });
  } catch (err) {
    console.error("❌ Error fetching owner properties:", err);
    res.status(500).json({ error: "Failed to load properties" });
  }
});

/* ---------- OWNER BOOKINGS ---------- */
router.get("/bookings/:ownerId", async (req, res) => {
  try {
    console.log("=" .repeat(50));
    console.log("📅 GET /owner/bookings/:ownerId called");
    console.log("📝 ownerId from params:", req.params.ownerId);
    console.log("=" .repeat(50));

    const [rows] = await db.query(
      `
      SELECT 
        b.id, b.property_id, b.user_id, b.check_in, b.check_out, b.total_price, b.status,
        u.name AS guest_name, u.email AS guest_email,
        p.title AS title, p.location
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.user_id = u.id
      WHERE p.owner_id = ?
      ORDER BY b.created_at DESC
      `,
      [req.params.ownerId]
    );

    console.log("✅ Found", rows.length, "bookings");
    console.log("📦 Bookings:", rows);
    res.json({ bookings: rows });
  } catch (err) {
    console.error("❌ Error fetching owner bookings:", err);
    res.status(500).json({ error: "Failed to load bookings" });
  }
});

router.delete("/property/:id", async (req, res) => {
  try {
    console.log("🗑️ DELETE /owner/property/:id called");
    console.log("📝 property id:", req.params.id);

    await db.query("DELETE FROM properties WHERE id = ?", [req.params.id]);
    res.json({ message: "Property deleted" });
  } catch (err) {
    console.error("❌ Error deleting property:", err);
    res.status(500).json({ error: "Failed to delete property" });
  }
});

export default router;
