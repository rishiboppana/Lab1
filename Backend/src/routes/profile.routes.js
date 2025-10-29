import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

const r = Router();
r.use(requireAuth);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "src/uploads/avatars");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "avatar-" + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    
    if (mime && ext) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed (jpeg, jpg, png, gif)"));
    }
  }
});

r.post("/avatar", upload.single("avatar"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const url = "/uploads/avatars/" + req.file.filename;
  const updated = await User.update(req.session.user.id, { avatar_url: url });
  
  res.json({ 
    avatar_url: url,
    profile: updated
  });
});

export default r;