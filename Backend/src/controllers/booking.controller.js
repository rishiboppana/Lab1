import { Booking } from '../models/Booking.js';
import { Property } from '../models/Property.js';
import { overlaps } from '../utils/overlap.js';

export async function createBooking(req, res) {
  const { property_id, start_date, end_date, guests } = req.body;
  // prevent double booking (check overlap)
  const p = await Property.getById(property_id);
  if (!p) return res.status(404).json({ error: 'Property not found' });

  const bs = await Booking.forProperty(property_id);
  const conflict = bs.some(b => overlaps(b.start_date, b.end_date, start_date, end_date));
  if (conflict) return res.status(409).json({ error: 'Dates unavailable' });

  const b = await Booking.create({
    traveler_id: req.session.user.id,
    property_id, start_date, end_date, guests: guests || 1
  });
  res.json({ booking: b });
}

export async function myBookings(req, res) {
  const role = req.session.user.role;
  const data = role === 'owner'
    ? await Booking.forOwner(req.session.user.id)
    : await Booking.forTraveler(req.session.user.id);
  res.json({ bookings: data });
}

export async function setStatus(req, res) {
  const { status } = req.body; // ACCEPTED or CANCELLED
  const b = await Booking.setStatus(+req.params.id, status);
  res.json({ booking: b });
}
