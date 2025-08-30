// routes/watchlist.js
import express from "express";
import axios from "axios";

const router = express.Router();

export default function (db, TMDB_KEY) {
  // GET /watchlist
  router.get("/", async (req, res) => {
    try {
      const result = await db.query("SELECT * FROM watchlist");
      const user_movie_ids = result.rows.map((row) => row.id);
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
  router.post("/", (req, res) => {
    const { movie_id } = req.body;
    const selectedMovie = movie_id;

    console.log("This movie has been selected:", selectedMovie);

    const query =
      "INSERT INTO watchlist (id) VALUES ($1) ON CONFLICT (id) DO NOTHING";

    db.query(query, [selectedMovie], (err, result) => {
      if (err) {
        console.error("Error inserting movie:", err.stack);
        return res.status(500).json({ error: "Database insert failed" });
      }

      if (result.rowCount === 0) {
        console.log("⚠️ Movie already exists in watchlist:", selectedMovie);
        return res.json({ message: "Movie is already in your watchlist!" });
      }

      console.log("✅ Movie inserted into watchlist:", selectedMovie);
      res.json({ message: "Movie received successfully!" });
    });
  });

  // DELETE /watchlist/:id
  router.delete("/:id", async (req, res) => {
    const movieId = parseInt(req.params.id);

    try {
      const deleteResult = await db.query(
        "DELETE FROM watchlist WHERE id = $1 RETURNING *",
        [movieId]
      );

      if (deleteResult.rowCount === 0) {
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
}
