import { pool } from "../config/db.js";

export async function handleBookingMessage({ operation, payload }) {
  switch (operation) {
    case "CREATE_BOOKING":
      return await createBooking(payload);

    case "FETCH_MY_BOOKINGS":
      return await fetchMyBookings(payload);

    case "UPDATE_STATUS":
      return await updateBookingStatus(payload);

    default:
      console.log("⚠️ Unknown booking operation", operation);
  }
}

/* ====================================
   CREATE BOOKING
===================================== */
async function createBooking({ traveler_id, property_id, start_date, end_date, guests }) {
  // Check property exists
  const [p] = await pool.query("SELECT * FROM properties WHERE id=?", [property_id]);
  if (!p.length) return console.log("❌ Property not found");

  // Overlap check
  const [bs] = await pool.query(
    `SELECT start_date, end_date FROM bookings 
     WHERE property_id=? AND status IN ('PENDING','ACCEPTED')`,
    [property_id]
  );

  const conflict = bs.some(b =>
    !(b.end_date <= start_date || b.start_date >= end_date)
  );

  if (conflict) return console.log("❌ Date overlap. Booking denied.");

  await pool.query(
    `INSERT INTO bookings 
      (traveler_id, property_id, start_date, end_date, guests, status)
      VALUES (?, ?, ?, ?, ?, 'PENDING')`,
    [traveler_id, property_id, start_date, end_date, guests]
  );

  console.log("✅ Booking created");
}

/* ====================================
   FETCH BOOKINGS
===================================== */
async function fetchMyBookings({ user_id, role }) {
  const query =
    role === "owner"
      ? `SELECT b.*, p.title, p.location 
           FROM bookings b JOIN properties p ON b.property_id=p.id
           WHERE p.owner_id=? ORDER BY created_at DESC`
      : `SELECT b.*, p.title, p.location 
           FROM bookings b JOIN properties p ON b.property_id=p.id
           WHERE traveler_id=? ORDER BY created_at DESC`;

  const [rows] = await pool.query(query, [user_id]);

  console.log(`📄 ${rows.length} bookings fetched`);
}

/* ====================================
   UPDATE STATUS
===================================== */
async function updateBookingStatus({ booking_id, status }) {
  await pool.query("UPDATE bookings SET status=? WHERE id=?", [
    status,
    booking_id,
  ]);

  console.log(`🔄 Booking ${booking_id} updated to ${status}`);
}
