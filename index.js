// ========================
// IMPORTS
// ========================
process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';
import express, { response } from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import axios from "axios";
import "dotenv/config";

import { Client } from "pg";


// ========================
// INITIALIZE APP
// =======================
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3000;

// ========================
// DATABASE SETUP
// ========================


import { Client } from "pg";

// Force IPv4 DNS resolution (keep this at the very top)
process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';

const db = new Client({
  host: process.env.DB_HOST,      // Supabase host
  user: process.env.DB_USER,      // postgres
  password: process.env.DB_PASS,  // your password
  database: process.env.DB_NAME,  // movies
  port: Number(process.env.DB_PORT) || 5432,
  ssl: { rejectUnauthorized: false }
  // family: 4   // optional: comment out if IPv6 issues persist locally
});

db.connect()
  .then(() => console.log("✅ Connected to Supabase!"))
  .catch(err => console.error("❌ Database connection error:", err));

export default db;

// ========================
// TMDB & UTILITY FUNCTIONS
// ========================

const TMDB_KEY = process.env.TMDB_KEY;
function formatMovieQuery(userInput) {
  // Trim leading/trailing spaces and encode special characters
  return encodeURIComponent(userInput.trim());
}
function mostPopularGenre(genres) {
  if (!genres || genres.length === 0) return null;

  const countMap = {};

  // Count frequency of each genre
  for (const genre of genres) {
    countMap[genre] = (countMap[genre] || 0) + 1;
  }

  // Find the genre with max count
  let maxGenre = null;
  let maxCount = 0;

  for (const [genre, count] of Object.entries(countMap)) {
    if (count > maxCount) {
      maxCount = count;
      maxGenre = genre;
    }
  }

  return maxGenre;
}

// ========================
// GENRE LIST
// ========================
const genreList = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};
// ========================
// MIDDLEWARE
// ========================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
// ========================
// ROUTES IMPORT
// ========================
import contactRoutes from "./routes/contact.js";
import recommendationsRoutes from "./routes/recommendations.js";
import watchlistRoutes from "./routes/watchlist.js";
import searchRoutes from "./routes/search.js";
import newsRoutes from "./routes/news.js";
import trendingRoutes from "./routes/trending.js";
import reviewsRoutes from "./routes/reviews.js";
import homeRoutes from "./routes/home.js";
// ========================
// ROUTES SETUP
// ========================
app.use("/home", homeRoutes);
app.use("/reviews", reviewsRoutes(db, TMDB_KEY));
app.use("/trending", trendingRoutes(TMDB_KEY, genreList));
app.use("/news", newsRoutes(process.env.NEWS_API_KEY));
app.use("/search", searchRoutes(TMDB_KEY, formatMovieQuery));
app.use("/watchlist", watchlistRoutes(db, TMDB_KEY));
app.use("/contact", contactRoutes);
app.use("/recommendations", recommendationsRoutes(db, TMDB_KEY));
// ========================
// START SERVER
// ========================
app.listen(port, () => {
  console.log("Server Up!!");
});
