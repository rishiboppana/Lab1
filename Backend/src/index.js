import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import locationRoutes from "./routes/location.js";

import { ENV } from './config/env.js';
import { errorHandler } from './middleware/error.js';

import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import propertyRoutes from './routes/property.routes.js';
// import bookingRoutes from './routes/booking.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import reviewRoutes from "./routes/reviews.js";
import bookingRoutes from "./routes/bookings.js";
import ownerRoutes from "./routes/owner.js";


// get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// sessions

app.use(
  session({
    name: "sid",
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);
// serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/owner", ownerRoutes);

app.use("/api/reviews", reviewRoutes);

// health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// error handler
app.use(errorHandler);

// start server
app.listen(ENV.PORT, () =>
  console.log(`Server running on http://localhost:${ENV.PORT}`)
);
