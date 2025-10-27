import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 4000,
  ORIGIN: process.env.ORIGIN || 'http://localhost:5173',
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASS: process.env.DB_PASS || 'Kapil@123',
  DB_NAME: process.env.DB_NAME || 'airbnb',
  SESSION_SECRET: process.env.SESSION_SECRET || 'devsecret',
  SESSION_NAME: process.env.SESSION_NAME || 'sid'
};
