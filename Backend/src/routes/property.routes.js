import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth, requireOwner } from "../middleware/auth.js";
import db from "../config/db.js";
import {
  createProperty,
  updateProperty,
  removeProperty,
  getOne,
  search,
  ownerList,
} from "../controllers/property.controller.js";

const r = Router();

/* ---------------------- IMAGE UPLOAD CONFIG ---------------------- */

// Create uploads directory if missing
const uploadDir = path.join(process.cwd(), "src/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname.replace(/\s+/g, ""));
  },
});
const upload = multer({ storage });

/* ---------------------- PUBLIC ROUTES ---------------------- */

// ✅ UPDATED: Search properties with optional filters (location, guests, price)
r.get("/search", async (req, res) => {
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

    // ✅ NEW: Filter by number of guests (properties that can accommodate this many)
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

// ✅ Get single property with avg rating + review count + bookings
r.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*,
              CAST(ROUND(AVG(r.rating), 1) AS DECIMAL(2,1)) AS avg_rating,
              COUNT(DISTINCT r.id) AS review_count
       FROM properties p
       LEFT JOIN reviews r ON p.id = r.property_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Property not found" });
    }

    const property = rows[0];

    // ✅ Get ALL bookings for this property (with status and user_id)
    const [bookings] = await db.query(
      `SELECT id, user_id, check_in, check_out, status, total_price
       FROM bookings
       WHERE property_id = ?
       ORDER BY check_in ASC`,
      [req.params.id]
    );

    console.log("📅 All bookings for property:", bookings);

    res.json({ property, bookings });
  } catch (err) {
    console.error("Error fetching property:", err);
    res.status(500).json({ error: "Failed to fetch property" });
  }
});

r.use(requireAuth, requireOwner);

// ✅ UPDATED: Add new property (handles image upload + number_of_guests)
r.post("/", requireAuth, upload.array("images", 5), async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: "Not logged in" });

    // If the user is not an owner, promote them automatically
    if (user.role !== "owner") {
      await db.query("UPDATE users SET role='owner' WHERE id=?", [user.id]);
      user.role = "owner";
      req.session.user.role = "owner";
      console.log(`User ${user.id} promoted to owner.`);
    }

    // ✅ UPDATED: Extract form data including number_of_guests
    const {
      title,
      type,
      location,
      description,
      price_per_night,
      bedrooms,
      bathrooms,
      number_of_guests,  // ✅ NEW FIELD
      amenities,
    } = req.body;

    // Validate required fields
    if (!title || !location || !price_per_night) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate number_of_guests
    const guestCount = parseInt(number_of_guests) || 1;
    if (guestCount < 1) {
      return res.status(400).json({ error: "Number of guests must be at least 1" });
    }

    const amenityList = amenities
      ? JSON.stringify(
          amenities
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a)
        )
      : "[]";

    const imagePaths = JSON.stringify(
      (req.files || []).map((f) => `/uploads/${f.filename}`)
    );

    // ✅ UPDATED: Insert into DB with number_of_guests
    await db.query(
      `
      INSERT INTO properties
        (owner_id, title, type, location, description, price_per_night,
         bedrooms, bathrooms, number_of_guests, amenities, images, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [
        user.id,
        title,
        type,
        location,
        description,
        price_per_night,
        bedrooms || 1,
        bathrooms || 1,
        guestCount,  // ✅ NEW
        amenityList,
        imagePaths,
      ]
    );

    res.json({ message: "Property added successfully!" });
  } catch (err) {
    console.error("Error creating property:", err);
    res.status(500).json({ error: "Failed to create property" });
  }
});

// ✅ UPDATED: Update property route with number_of_guests
r.put("/:id", requireAuth, upload.array("images", 5), async (req, res) => {
  try {
    const id = req.params.id;

    const {
      title,
      type,
      location,
      description,
      price_per_night,
      bedrooms,
      bathrooms,
      number_of_guests,  // ✅ NEW FIELD
      amenities,
      imageAction,
      existingImages,
    } = req.body;

    // Fetch existing property
    const [rows] = await db.query("SELECT * FROM properties WHERE id = ?", [id]);
    if (!rows.length) {
      return res.status(404).json({ error: "Property not found" });
    }

    const existing = rows[0];

    // Check ownership
    if (existing.owner_id !== req.session.user?.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Parse existing images that user wants to keep
    let keptImages = [];
    if (existingImages) {
      try {
        keptImages = JSON.parse(existingImages);
      } catch {
        keptImages = [];
      }
    }

    // Parse old amenities
    let oldAmenities = [];
    try {
      if (existing.amenities) {
        oldAmenities = JSON.parse(existing.amenities);
      }
    } catch {
      oldAmenities = [];
    }

    // Handle NEW images with 5-image limit
    let finalImages = keptImages;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);

      if (newImages.length > 5) {
        return res.status(400).json({
          error: "Cannot upload more than 5 images at once"
        });
      }

      if (imageAction === "replace") {
        finalImages = newImages;
        console.log("🔄 Replacing all images with new ones");
      } else {
        const combined = [...keptImages, ...newImages];

        if (combined.length > 5) {
          return res.status(400).json({
            error: `Cannot have more than 5 images total. You have ${keptImages.length} existing images, so you can only add ${5 - keptImages.length} more.`
          });
        }

        finalImages = combined;
        console.log("➕ Adding new images to kept images");
      }
    }

    // Validate: must have at least 1 image
    if (finalImages.length === 0) {
      return res.status(400).json({
        error: "Property must have at least 1 image"
      });
    }

    if (finalImages.length > 5) {
      return res.status(400).json({
        error: "Cannot have more than 5 images for a property"
      });
    }

    console.log("Final images count:", finalImages.length);

    // Handle amenities
    let amenityList = oldAmenities;
    if (typeof amenities === "string" && amenities.trim()) {
      amenityList = amenities.split(",").map((a) => a.trim()).filter(Boolean);
    }

    // ✅ UPDATED: Build update object with number_of_guests
    const guestCount = number_of_guests ? parseInt(number_of_guests) : existing.number_of_guests;

    if (guestCount < 1) {
      return res.status(400).json({ error: "Number of guests must be at least 1" });
    }

    const updated = {
      title: title || existing.title,
      type: type || existing.type,
      location: location || existing.location,
      description: description || existing.description,
      price_per_night: price_per_night || existing.price_per_night,
      bedrooms: bedrooms || existing.bedrooms,
      bathrooms: bathrooms || existing.bathrooms,
      number_of_guests: guestCount,  // ✅ NEW
      amenities: JSON.stringify(amenityList),
      images: JSON.stringify(finalImages),
    };

    // ✅ UPDATED: Update database with number_of_guests
    await db.query(
      `UPDATE properties
       SET title=?, type=?, location=?, description=?, price_per_night=?,
           bedrooms=?, bathrooms=?, number_of_guests=?, amenities=?, images=?
       WHERE id=?`,
      [
        updated.title,
        updated.type,
        updated.location,
        updated.description,
        updated.price_per_night,
        updated.bedrooms,
        updated.bathrooms,
        updated.number_of_guests,  // ✅ NEW
        updated.amenities,
        updated.images,
        id,
      ]
    );

    res.json({
      message: "Property updated successfully",
      property: updated
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({
      error: "Failed to update property",
      details: err.message
    });
  }
});

// Delete property
r.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM properties WHERE id = ?", [req.params.id]);
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("Error deleting property:", err);
    res.status(500).json({ error: "Failed to delete property" });
  }
});

// ✅ UPDATED: List all properties by owner
r.get("/owner/list", async (req, res) => {
  try {
    const ownerId = req.session.user?.id;
    if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

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
      [ownerId]
    );
    res.json({ properties: rows });
  } catch (err) {
    console.error("Error fetching owner properties:", err);
    res.status(500).json({ error: "Failed to load properties" });
  }
});

export default r;
