import { Kafka } from "kafkajs";
import { handleBookingMessage } from "./handlers/booking.handler.js";

const kafka = new Kafka({
  clientId: "booking-service",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "booking-group" });

async function start() {
  await consumer.connect();
  await consumer.subscribe({ topic: "booking-requests" });

  console.log("📡 Booking Service listening on booking-requests topic");

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      console.log("📩 Incoming Kafka Request:", data);

      await handleBookingMessage(data);
    },
  });
}

start();
