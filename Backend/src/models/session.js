import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  pwd_hash: { type: String, required: true },  // <-- CHANGED THIS
  created_at: { type: Date, default: Date.now }
});

export const Session = mongoose.model("Session", SessionSchema);
