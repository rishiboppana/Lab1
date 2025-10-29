const express = require('express');
const router = express.Router();
const Property = require('../Models/properties');
const db = require('../config/db'); // ← Add this import

// GET all properties (existing - don't change)
router.get('/', async (req, res) => {
  try {
    const properties = await Property.findAll();
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// ✅ NEW: Search endpoint with filters (location, number_of_guests, price)
router.get('/search', async (req, res) => {
  try {
    const { location, number_of_guests, minPrice, maxPrice } = req.query;

    let sql = `
      SELECT p.*,
             CAST(ROUND(AVG(r.rating),1) AS DECIMAL(2,1)) AS avg_rating,
             COUNT(r.id) AS review_count
        FROM properties p
        LEFT JOIN reviews r ON p.id = r.property_id
       WHERE 1=1
    `;

    const params = [];

    // Filter by location
    if (location) {
      sql += " AND p.location LIKE ?";
      params.push(`%${location}%`);
    }

    // ✅ NEW: Filter by number of guests
    if (number_of_guests) {
      sql += " AND p.number_of_guests >= ?";
      params.push(parseInt(number_of_guests));
    }

    // ✅ NEW: Filter by minimum price
    if (minPrice) {
      sql += " AND p.price_per_night >= ?";
      params.push(parseFloat(minPrice));
    }

    // ✅ NEW: Filter by maximum price
    if (maxPrice) {
      sql += " AND p.price_per_night <= ?";
      params.push(parseFloat(maxPrice));
    }

    sql += " GROUP BY p.id ORDER BY p.created_at DESC";

    const [rows] = await db.query(sql, params);
    res.json({ properties: rows });
  } catch (err) {
    console.error("Error in /search:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

module.exports = router;
