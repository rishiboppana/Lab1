import { Router } from "express";
import fetch from "node-fetch";

const r = Router();

r.get("/", async (_req, res) => {
  try {
    const response = await fetch("https://ipinfo.io/json?token=<your_free_token>");
    const text = await response.text();

    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Non-JSON from ipinfo:", text.slice(0, 80));
      return res.json({ city: "your area" });
    }

    res.json({ city: data.city || "your area" });
  } catch (err) {
    console.error("Location fetch failed:", err);
    res.json({ city: "your area" });
  }
});

export default r;
// import { Router } from "express";
// const r = Router();
//
// // Stable dev fallback — no external API, no rate limits
// r.get("/", (_req, res) => {
//   res.json({ city: "your area" });
// });
//
// export default r;
