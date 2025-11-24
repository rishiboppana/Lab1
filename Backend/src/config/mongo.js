import mongoose from "mongoose";

export async function connectMongo() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://admin:adminpassword@mongodb:27017/sessiondb?authSource=admin";
    await mongoose.connect(mongoUri);
    console.log("🍃 MongoDB connected");
  } catch (err) {
    console.error("MongoDB error:", err);
  }
}