import { Property } from "../models/Property.js";
import { Booking } from "../models/Booking.js";
import { overlaps } from "../utils/overlap.js";
import db from "../config/db.js"; // ensure this exists

/* ---------------------- CREATE PROPERTY ---------------------- */
export async function createProperty(req, res) {
  try {
    const body = req.body;
    const images = (req.files || []).map((f) => `/uploads/${f.filename}`);

    // combine body and images
    const property = await Property.create(req.session.user.id, {
      ...body,
      images,
    });

    res.json({ property });
  } catch (err) {
    console.error("Error creating property:", err);
    res.status(500).json({ error: "Failed to create property" });
  }
}

/* ---------------------- UPDATE PROPERTY ---------------------- */
export async function updateProperty(req, res) {
  try {
    const id = +req.params.id;
    const userId = req.session.user.id;

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

    // Parse amenities safely
    const amenityList =
      typeof amenities === "string"
        ? amenities.split(",").map((a) => a.trim())
        : [];

    // Handle image uploads
    const newImages = (req.files || []).map((f) => `/uploads/${f.filename}`);

    // Get current property to preserve old images if no new ones provided
    const existing = await Property.getById(id);
    if (!existing || existing.owner_id !== userId) {
      return res.status(404).json({ error: "Not found or not owner" });
    }

    const imagesToSave = newImages.length ? newImages : existing.images;

    // Update DB
    const [result] = await db.query(
      `
        UPDATE properties
        SET title=?, type=?, location=?, description=?, price_per_night=?,
            bedrooms=?, bathrooms=?, amenities=?, images=?
        WHERE id=? AND owner_id=?`,
      [
        title || existing.title,
        type || existing.type,
        location || existing.location,
        description || existing.description,
        price_per_night || existing.price_per_night,
        bedrooms || existing.bedrooms,
        bathrooms || existing.bathrooms,
        JSON.stringify(amenityList.length ? amenityList : existing.amenities),
        JSON.stringify(imagesToSave),
        id,
        userId,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found or not owner" });

    const updated = await Property.getById(id);
    res.json({ property: updated });
  } catch (err) {
    console.error("Error updating property:", err);
    res.status(500).json({ error: "Failed to update property" });
  }
}

/* ---------------------- DELETE PROPERTY ---------------------- */
export async function removeProperty(req, res) {
  try {
    const r = await Property.remove(+req.params.id, req.session.user.id);
    if (!r) return res.status(404).json({ error: "Not found or not owner" });
    res.json({ ok: true });
  } catch (err) {
    console.error("Error removing property:", err);
    res.status(500).json({ error: "Failed to delete property" });
  }
}

/* ---------------------- GET SINGLE PROPERTY ---------------------- */
export async function getOne(req, res) {
  try {
    const p = await Property.getById(+req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });

    const bookings = await Booking.forProperty(p.id);
    res.json({ property: p, bookings });
  } catch (err) {
    console.error("Error fetching property:", err);
    res.status(500).json({ error: "Failed to fetch property" });
  }
}

/* ---------------------- SEARCH PROPERTIES ---------------------- */
export async function search(req, res) {
  try {
    const items = await Property.search(req.query);
    const { startDate, endDate } = req.query;

    if (startDate && endDate) {
      const filtered = [];
      for (const p of items) {
        const bs = await Booking.forProperty(p.id);
        const conflict = bs.some((b) =>
          overlaps(b.start_date, b.end_date, startDate, endDate)
        );
        if (!conflict) filtered.push(p);
      }
      return res.json({ properties: filtered });
    }

    res.json({ properties: items });
  } catch (err) {
    console.error("Error in property search:", err);
    res.status(500).json({ error: "Failed to search properties" });
  }
}

/* ---------------------- OWNER LIST ---------------------- */
export async function ownerList(req, res) {
  try {
    const rows = await Property.ownerList(req.session.user.id);
    console.log(req.session.user)
    res.json({ properties: rows });
  } catch (err) {
    console.error("Error fetching owner list:", err);
    res.status(500).json({ error: "Failed to load owner properties" });
  }
}
