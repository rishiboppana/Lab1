import mysql from 'mysql2/promise';
import { ENV } from './env.js';

export const pool = mysql.createPool({
  host: ENV.DB_HOST,
  user: ENV.DB_USER,
  password: ENV.DB_PASS,
  database: ENV.DB_NAME,
  connectionLimit: 10
});
