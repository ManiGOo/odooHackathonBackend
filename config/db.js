import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for NeonDB
  },
});

pool.connect()
  .then(client => {
    console.log("Connected to PostgreSQL successfully");
    client.release();
  })
  .catch(err => {
    console.error("Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  });

export default pool;
