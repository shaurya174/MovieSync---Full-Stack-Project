import express from "express";
import axios from "axios";
import sql from "../db.js"; // postgres client

const router = express.Router();

export default function (TMDB_KEY) {
  // GET /watchlist
  router.get("/", async (req, res) => {
    try {
      const watchlistRows = await sql`SELECT * FROM watchlist`;
      const user_movie_ids = watchlistRows.map(row => row.id);
      const user_data_movies = [];

      for (const movie_id of user_movie_ids) {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${movie_id}?api_key=${TMDB_KEY}&language=en-US`
        );
        user_data_movies.push(response.data);
      }

      res.render("watchlist", { movies: user_data_movies });
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
  });

  // POST /watchlist
  router.post("/", async (req, res) => {
    const { movie_id } = req.body;

    try {
      const result = await sql`
        INSERT INTO watchlist (id) VALUES (${movie_id})
        ON CONFLICT (id) DO NOTHING
        RETURNING id
      `;

      if (result.length === 0) {
        console.log("⚠️ Movie already exists in watchlist:", movie_id);
        return res.json({ message: "Movie is already in your watchlist!" });
      }

      console.log("✅ Movie inserted into watchlist:", movie_id);
      res.json({ message: "Movie received successfully!" });
    } catch (err) {
      console.error("Error inserting movie:", err);
      res.status(500).json({ error: "Database insert failed" });
    }
  });

  // DELETE /watchlist/:id
  router.delete("/:id", async (req, res) => {
    const movieId = parseInt(req.params.id);

    try {
      const deleteResult = await sql`
        DELETE FROM watchlist WHERE id = ${movieId} RETURNING *
      `;

      if (deleteResult.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Movie not found" });
      }

      console.log(`Deleted movie: ${movieId}`);
      res.json({ success: true, id: movieId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  });

  return router;
};

