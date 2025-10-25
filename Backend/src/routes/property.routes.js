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

    const imagePaths = req.files.map((f) => `/uploads/${f.filename}`);
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
r.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    const id = req.params.id;

    // destructure request body
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

    // ✅ Step 1: fetch existing property
    const [rows] = await db.query("SELECT * FROM properties WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ error: "Property not found" });

    const existing = rows[0];

    // ✅ Step 2: safely parse old images and amenities
    let oldImages = [];
    let oldAmenities = [];

    try {
      if (existing.images) oldImages = JSON.parse(existing.images);
    } catch {
      oldImages = [];
    }
    try {
      if (existing.amenities) oldAmenities = JSON.parse(existing.amenities);
    } catch {
      oldAmenities = [];
    }

    // ✅ Step 3: process new uploads (if any)
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((f) => `/uploads/${f.filename}`);
    }

    // ✅ Step 4: decide final image array
    // If new images uploaded, merge them; otherwise keep old images.
    const finalImages =
      newImages.length > 0 ? [...oldImages, ...newImages] : oldImages;

    // ✅ Step 5: handle amenities
    let amenityList = [];
    if (typeof amenities === "string" && amenities.trim()) {
      amenityList = amenities.split(",").map((a) => a.trim());
    } else {
      amenityList = oldAmenities;
    }

    // ✅ Step 6: build final merged object
    const updated = {
      title: title?.trim() || existing.title,
      type: type?.trim() || existing.type,
      location: location?.trim() || existing.location,
      description: description?.trim() || existing.description,
      price_per_night: price_per_night || existing.price_per_night,
      bedrooms: bedrooms || existing.bedrooms,
      bathrooms: bathrooms || existing.bathrooms,
      amenities: JSON.stringify(amenityList),
      images: JSON.stringify(finalImages),
    };

    console.log("🖼️ Final images:", updated.images);

    // ✅ Step 7: update database safely
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

    res.json({ message: "✅ Property updated successfully" });
  } catch (err) {
    console.error("🔥 Error updating property:", err);
    res.status(500).json({ error: "Failed to update property" });
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
