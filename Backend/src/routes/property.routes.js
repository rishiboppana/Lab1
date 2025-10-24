import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireOwner } from '../middleware/auth.js';
import {
  createProperty,
  updateProperty,
  removeProperty,
  getOne,
  search,
  ownerList
} from '../controllers/property.controller.js';

const r = Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'src/uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// public search + single view
r.get('/search', search);
r.get('/:id', getOne);

// owner-only CRUD
r.use(requireAuth, requireOwner);
r.post('/', upload.array('images', 5), createProperty);
r.put('/:id', upload.array('images', 5), updateProperty);
r.delete('/:id', removeProperty);
r.get('/owner/list', ownerList);

export default r;
