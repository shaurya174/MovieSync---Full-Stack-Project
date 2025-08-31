import express from "express";
import axios from "axios";
import sql from "../db.js"; // postgres client

const router = express.Router();

export default function (TMDB_KEY) {
  // GET /reviews
  router.get("/", async (req, res) => {
    try {
      // 1️⃣ Get watchlist IDs
      const watchlistRows = await sql`SELECT id FROM watchlist`;
      const watchlistIds = watchlistRows.map(r => r.id);

      if (watchlistIds.length === 0) {
        return res.render("reviews", { movies: [] });
      }

      // 2️⃣ Get existing reviews
      const reviewsRows = await sql`SELECT id, review FROM reviews`;
      const reviewsMap = {};
      reviewsRows.forEach(r => {
        reviewsMap[r.id] = r.review;
      });

      // 3️⃣ Fetch movie details from TMDB
      const movies = [];
      for (let id of watchlistIds) {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=en-US`
        );
        const movie = response.data;

        movies.push({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          overview: movie.overview,
          review: reviewsMap[movie.id] || null,
        });
      }

      res.render("reviews", { movies });
    } catch (err) {
      console.error("Error in /reviews:", err.message);
      res.status(500).send("Internal Server Error");
    }
  });

  // POST /reviews/save
  router.post("/save", async (req, res) => {
    try {
      const { id, review } = req.body;

      // Check if review exists
      const checkRows = await sql`SELECT * FROM reviews WHERE id = ${id}`;

      if (checkRows.length > 0) {
        await sql`UPDATE reviews SET review = ${review} WHERE id = ${id}`;
      } else {
        await sql`INSERT INTO reviews (id, review) VALUES (${id}, ${review})`;
      }

      res.redirect("/reviews");
    } catch (err) {
      console.error("Error saving review:", err.message);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
};
