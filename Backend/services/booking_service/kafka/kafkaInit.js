// kafka/kafkaInit.js
const { Kafka } = require("kafkajs");

let kafka;
let producer;
let consumer;

async function initKafka() {
  kafka = new Kafka({
    clientId: "booking-service",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"], // Update in K8s
  });

  producer = kafka.producer();
  consumer = kafka.consumer({ groupId: "booking-service-group" });

  await producer.connect();
  await consumer.connect();

  console.log("📨 KafkaJS Producer & Consumer connected");

  // Consume OWNER updates (owner accepted/cancelled)
  await consumer.subscribe({ topic: "booking.status.updated", fromBeginning: false });

  consumer.run({
    eachMessage: async ({ topic, message }) => {
      const msg = JSON.parse(message.value.toString());

      console.log("📥 Kafka Message Received:", msg);

      if (topic === "booking.status.updated") {
        // Here we update booking status in DB
        const Booking = require("../models/booking");

        const booking = await Booking.findByPk(msg.booking_id);
        if (!booking) return;

        await booking.update({ status: msg.status });
        console.log(`🔄 Booking ${msg.booking_id} updated to ${msg.status}`);
      }
    },
  });
}

async function publishEvent(topic, payload) {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }],
  });

  console.log(`📤 Kafka Event Published → ${topic}`, payload);
}

module.exports = { initKafka, publishEvent };
