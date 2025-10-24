import { Property } from '../models/Property.js';
import { Booking } from '../models/Booking.js';
import { overlaps } from '../utils/overlap.js';

export async function createProperty(req, res) {
  const body = req.body;
  // images handled by multer
  const images = (req.files || []).map(f => `/uploads/${f.filename}`);
  const property = await Property.create(req.session.user.id, { ...body, images });
  res.json({ property });
}

export async function updateProperty(req, res) {
  const images = (req.files || []).map(f => `/uploads/${f.filename}`);
  const updated = await Property.update(+req.params.id, req.session.user.id, { ...req.body, images });
  if (!updated) return res.status(404).json({ error: 'Not found or not owner' });
  res.json({ property: updated });
}

export async function removeProperty(req, res) {
  const r = await Property.remove(+req.params.id, req.session.user.id);
  if (!r) return res.status(404).json({ error: 'Not found or not owner' });
  res.json({ ok: true });
}

export async function getOne(req, res) {
  const p = await Property.getById(+req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  // also return disabled dates (booked/pending)
  const bookings = await Booking.forProperty(p.id);
  res.json({ property: p, bookings });
}

export async function search(req, res) {
  const items = await Property.search(req.query);
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    // filter out properties that have overlapping bookings
    const filtered = [];
    for (const p of items) {
      const bs = await Booking.forProperty(p.id);
      const conflict = bs.some(b => overlaps(b.start_date, b.end_date, startDate, endDate));
      if (!conflict) filtered.push(p);
    }
    return res.json({ properties: filtered });
  }

  res.json({ properties: items });
}

export async function ownerList(req, res) {
  const rows = await Property.ownerList(req.session.user.id);
  res.json({ properties: rows });
}
