import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "api-gateway",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
await producer.connect();

const r = Router();
r.use(requireAuth);

// ✔ Create booking
r.post("/", async (req, res) => {
  await producer.send({
    topic: "booking-requests",
    messages: [
      {
        value: JSON.stringify({
          operation: "CREATE_BOOKING",
          payload: {
            traveler_id: req.session.user.id,
            ...req.body,
          },
        }),
      },
    ],
  });

  res.status(202).json({ message: "Booking request sent to Kafka" });
});

// ✔ My bookings
r.get("/", async (req, res) => {
  await producer.send({
    topic: "booking-requests",
    messages: [
      {
        value: JSON.stringify({
          operation: "FETCH_MY_BOOKINGS",
          payload: {
            user_id: req.session.user.id,
            role: req.session.user.role,
          },
        }),
      },
    ],
  });

  res.status(202).json({ message: "Fetch request sent to Kafka" });
});

// ✔ Update status
r.patch("/:id/status", async (req, res) => {
  await producer.send({
    topic: "booking-requests",
    messages: [
      {
        value: JSON.stringify({
          operation: "UPDATE_STATUS",
          payload: {
            booking_id: +req.params.id,
            status: req.body.status,
          },
        }),
      },
    ],
  });

  res.status(202).json({ message: "Status update queued" });
});

export default r;
