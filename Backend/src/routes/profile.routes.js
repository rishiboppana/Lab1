import { Router } from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

const r = Router();
r.use(requireAuth);

// --- GET profile ---
r.get("/", async (req, res) => {
  const u = await User.findById(req.session.user.id);
  res.json({ profile: u });
});

// --- PUT update profile ---
r.put("/", async (req, res) => {
  const allowed = [
    "name","email","phone","about",
    "city","country","languages","gender"
  ];
  const patch = {};
  for (const f of allowed)
    if (req.body[f] !== undefined) patch[f] = req.body[f];
  const updated = await User.update(req.session.user.id, patch);
  res.json({ profile: updated });
});

// --- Avatar upload ---
const storage = multer.diskStorage({
  destination: (_req, _file, cb) =>
    cb(null, path.join(process.cwd(), "src/uploads/avatars")),
  filename: (_req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

r.post("/avatar", upload.single("avatar"), async (req, res) => {
  const url = "/uploads/avatars/" + req.file.filename;
  await User.update(req.session.user.id, { avatar_url: url });
  res.json({ avatar_url: url });
});

export default r;
