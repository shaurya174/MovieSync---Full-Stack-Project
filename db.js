// db.js
import postgres from "postgres";
import "dotenv/config";

// Use your Pooler URL here
const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 10, // optional: maximum number of connections
});

export default sql;
