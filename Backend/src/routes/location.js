import express from "express";
import fetch from "node-fetch";   // if using Node 18+, global fetch works too
const router = express.Router();

// GET /api/location
router.get("/", async (req, res) => {
  try {
    const geoRes = await fetch("https://ipapi.co/json/");
    const data = await geoRes.json();
    res.json({ city: data.city, country: data.country_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ city: "your area" });
  }
});

export default router;
