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

// Search properties (with optional location filter)
r.get("/search", async (req, res) => {
  try {
    const { location } = req.query;

    let sql = `
      SELECT p.*,
             CAST(ROUND(AVG(r.rating),1) AS DECIMAL(2,1)) AS avg_rating,
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
  } catch (err) {
    console.error("Error in /search:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

//  Get single property with avg rating + review count
r.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT p.*,
             CAST(ROUND(AVG(r.rating),1) AS DECIMAL(2,1)) AS avg_rating,
             COUNT(r.id) AS review_count
        FROM properties p
        LEFT JOIN reviews r ON p.id = r.property_id
       WHERE p.id = ?
       GROUP BY p.id
    `,
      [req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ error: "Property not found" });

    res.json({ property: rows[0] });
  } catch (err) {
    console.error("Error fetching property:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/* ---------------------- OWNER-ONLY ROUTES ---------------------- */

r.use(requireAuth, requireOwner);

//  Add new property (handles image upload)
r.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const {
      owner_id,
      title,
      type,
      location,
      description,
      price_per_night,
      bedrooms,
      bathrooms,
      amenities,
    } = req.body;

    const imagePaths = req.files.map((f) => `uploads/${f.filename}`);
    const amenityList =
      typeof amenities === "string"
        ? amenities.split(",").map((a) => a.trim())
        : [];

    await db.query(
      `
      INSERT INTO properties
        (owner_id, title, type, location, description, price_per_night,
         bedrooms, bathrooms, amenities, images)
       VALUES (?,?,?,?,?,?,?,?,?,?)
    `,
      [
        owner_id,
        title,
        type,
        location,
        description,
        price_per_night,
        bedrooms,
        bathrooms,
        JSON.stringify(amenityList),
        JSON.stringify(imagePaths),
      ]
    );

    res.json({ message: "Property added successfully" });
  } catch (err) {
    console.error("Error creating property:", err);
    res.status(500).json({ error: "Failed to create property" });
  }
});

/* ---------- UPDATE PROPERTY ---------- */
r.put("/:id", requireAuth, upload.array("images", 5), async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ DEBUG: Log everything
    console.log("=" .repeat(50));
    console.log("📝 UPDATE REQUEST FOR PROPERTY:", id);
    console.log("📦 req.body:", req.body);
    console.log("🖼️ req.files:", req.files);
    console.log("📊 req.files length:", req.files?.length);
    console.log("=" .repeat(50));

    const {
      title,
      type,
      location,
      description,
      price_per_night,
      bedrooms,
      bathrooms,
      amenities,
    } = req.body;

    // ✅ Fetch existing property
    const [rows] = await db.query("SELECT * FROM properties WHERE id = ?", [id]);
    if (!rows.length) {
      return res.status(404).json({ error: "Property not found" });
    }

    const existing = rows[0];
    console.log("🏠 Existing property images:", existing.images);

    // ✅ Check ownership
    if (existing.owner_id !== req.session.user?.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // ✅ Parse old images
let oldImages = [];
try {
  if (existing.images) {
    // Check if it's already an array or a JSON string
    if (Array.isArray(existing.images)) {
      oldImages = existing.images;
    } else if (typeof existing.images === 'string') {
      // Try to parse as JSON first
      try {
        oldImages = JSON.parse(existing.images);
      } catch {
        // If parsing fails, it might be a single image path
        oldImages = [existing.images];
      }
    }
    console.log("✅ Parsed old images:", oldImages);
  }
} catch (err) {
  console.log("❌ Failed to parse old images:", err.message);
  oldImages = [];
}

    // ✅ Parse old amenities
    let oldAmenities = [];
    try {
      if (existing.amenities) {
        oldAmenities = JSON.parse(existing.amenities);
      }
    } catch {
      oldAmenities = [];
    }

    // ✅ Handle NEW images
    let finalImages = oldImages; // Default: keep old images

    console.log("🔍 Checking for new uploads...");
    console.log("   req.files exists?", !!req.files);
    console.log("   req.files.length:", req.files?.length);

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      console.log("🆕 New images uploaded:", newImages);
      finalImages = newImages; // Replace with new images
    } else {
      console.log("⏭️ No new images, keeping old ones:", oldImages);
    }

    // ✅ Handle amenities
    let amenityList = oldAmenities;
    if (typeof amenities === "string" && amenities.trim()) {
      amenityList = amenities.split(",").map((a) => a.trim()).filter(Boolean);
    }

    // ✅ Build update object
    const updated = {
      title: title || existing.title,
      type: type || existing.type,
      location: location || existing.location,
      description: description || existing.description,
      price_per_night: price_per_night || existing.price_per_night,
      bedrooms: bedrooms || existing.bedrooms,
      bathrooms: bathrooms || existing.bathrooms,
      amenities: JSON.stringify(amenityList),
      images: JSON.stringify(finalImages),
    };

    console.log("💾 About to save images:", updated.images);

    // ✅ Update database
    await db.query(
      `UPDATE properties
       SET title=?, type=?, location=?, description=?, price_per_night=?,
           bedrooms=?, bathrooms=?, amenities=?, images=?
       WHERE id=?`,
      [
        updated.title,
        updated.type,
        updated.location,
        updated.description,
        updated.price_per_night,
        updated.bedrooms,
        updated.bathrooms,
        updated.amenities,
        updated.images,
        id,
      ]
    );

    console.log("✅ Property updated successfully!");
    console.log("=" .repeat(50));

    res.json({
      message: "✅ Property updated successfully",
      property: updated
    });

  } catch (err) {
    console.error("🔥 ERROR:", err);
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

//  List all properties by owner
// List all properties owned by the logged-in user
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
