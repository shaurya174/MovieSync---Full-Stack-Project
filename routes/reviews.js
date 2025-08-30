// routes/reviews.js
import express from "express";
import axios from "axios";

const router = express.Router();

export default function (db, TMDB_KEY) {
  // GET /reviews
  router.get("/", async (req, res) => {
    try {
      const watchlistResult = await db.query("SELECT id FROM watchlist");
      const watchlistIds = watchlistResult.rows.map((r) => r.id);

      if (watchlistIds.length === 0) {
        return res.render("reviews", { movies: [] });
      }

      const reviewsResult = await db.query("SELECT id, review FROM reviews");
      const reviewsMap = {};
      reviewsResult.rows.forEach((r) => {
        reviewsMap[r.id] = r.review;
      });

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

      const check = await db.query("SELECT * FROM reviews WHERE id = $1", [id]);

      if (check.rows.length > 0) {
        await db.query("UPDATE reviews SET review = $1 WHERE id = $2", [
          review,
          id,
        ]);
      } else {
        await db.query("INSERT INTO reviews (id, review) VALUES ($1, $2)", [
          id,
          review,
        ]);
      }

      res.redirect("/reviews");
    } catch (err) {
      console.error("Error saving review:", err.message);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
}
