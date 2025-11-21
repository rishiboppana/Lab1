const Booking = require("../models/booking");

// ============= CREATE BOOKING (Traveler) =============
exports.createBooking = async (req, res) => {
  try {
    const {
      property_id,
      owner_id,
      user_id,
      check_in,
      check_out,
      total_price,
      guests
    } = req.body;

    const booking = await Booking.create({
      property_id,
      owner_id,
      user_id,
      check_in,
      check_out,
      total_price,
      guests,
      status: "Pending"
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============= GET BOOKING BY ID =============
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Not found" });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============= GET BOOKINGS FOR TRAVELER =============
exports.getBookingsForUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const bookings = await Booking.findAll({
      where: { user_id }
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============= GET PENDING BOOKINGS FOR OWNER =============
exports.getPendingBookingsForOwner = async (req, res) => {
  try {
    const { owner_id } = req.params;

    const bookings = await Booking.findAll({
      where: {
        owner_id,
        status: "Pending"
      }
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============= UPDATE BOOKING STATUS (Owner) =============
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const { status } = req.body;

    // Only these 2 statuses allowed for owner
    if (!["Accepted", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await booking.update({ status });

    res.json({
      message: `Booking ${status}`,
      booking
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
