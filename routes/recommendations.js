import express from "express";
import axios from "axios";
import sql from "../db.js"; // postgres client

const router = express.Router();

export default function (TMDB_KEY) {
  // GET /recommendations
  router.get("/", async (req, res) => {
    try {
      // 1️⃣ Fetch movie_ids from watchlist table
      const watchlistRows = await sql`SELECT id FROM watchlist`;
      const watchlistIds = watchlistRows.map(row => row.id);

      // 2️⃣ Count genres from these movies
      const genreCount = {};
      for (let id of watchlistIds) {
        const movieDetails = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}`
        );
        const genres = movieDetails.data.genres; // array of {id, name}
        genres.forEach((g) => {
          genreCount[g.id] = (genreCount[g.id] || 0) + 1;
        });
      }

      // 3️⃣ Find most popular genre
      let mostPopularGenreId = null;
      let maxCount = 0;
      for (const [genreId, count] of Object.entries(genreCount)) {
        if (count > maxCount) {
          maxCount = count;
          mostPopularGenreId = genreId;
        }
      }

      // 4️⃣ Fetch top 20 movies of that genre excluding watchlist
      const tmdbResponse = await axios.get(
        `https://api.themoviedb.org/3/discover/movie`,
        {
          params: {
            api_key: TMDB_KEY,
            with_genres: mostPopularGenreId,
            sort_by: "popularity.desc",
            page: 1,
          },
        }
      );

      const movies = [];
      const seen = new Set();
      for (const movie of tmdbResponse.data.results) {
        if (!watchlistIds.includes(movie.id) && !seen.has(movie.id)) {
          movies.push(movie);
          seen.add(movie.id);
        }
        if (movies.length >= 20) break;
      }

      res.render("recommendations", { movies });
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
  });

  return router;
};

