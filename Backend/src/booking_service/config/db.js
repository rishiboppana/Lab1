import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql",  // Changed from localhost
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "1234",  // Match docker-compose
  database: process.env.DB_NAME || "airbnb",  // Match docker-compose
});