import { Router } from 'express';
import { signup, login, me, logout } from '../controllers/auth.controller.js';
const r = Router();

r.post('/signup', signup);
r.post('/login', login);
r.get('/me', me);
r.post('/logout', logout);

export default r;
