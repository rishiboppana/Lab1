import mongoose from "mongoose";

export async function connectMongo() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/sessiondb");
    console.log("🍃 MongoDB connected");
  } catch (err) {
    console.error("MongoDB error:", err);
  }
}