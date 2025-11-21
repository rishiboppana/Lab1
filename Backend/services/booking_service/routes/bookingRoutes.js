const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookingById,
  getBookingsForUser,
  getPendingBookingsForOwner,
  updateBookingStatus
} = require("../controllers/bookingController");

// Traveler creates booking
router.post("/", createBooking);

// Traveler views their bookings
router.get("/user/:user_id", getBookingsForUser);

// Owner views all pending bookings
router.get("/pending/:owner_id", getPendingBookingsForOwner);

// Owner accepts or cancels booking
router.put("/:id/status", updateBookingStatus);

// Get single booking
router.get("/:id", getBookingById);

module.exports = router;
