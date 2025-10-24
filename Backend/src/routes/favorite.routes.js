import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { toggleFavorite, listFavorites } from '../controllers/favorite.controller.js';

const r = Router();
r.use(requireAuth);
r.get('/', listFavorites);
r.post('/toggle', toggleFavorite);

export default r;
