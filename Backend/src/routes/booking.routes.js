import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createBooking,
  myBookings,
  setStatus
} from '../controllers/booking.controller.js';

const r = Router();
r.use(requireAuth);
r.get('/', myBookings);
r.post('/', createBooking);
r.patch('/:id/status', setStatus);

export default r;
