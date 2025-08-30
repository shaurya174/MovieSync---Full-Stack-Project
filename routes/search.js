// routes/search.js
import express from "express";
import axios from "axios";

const router = express.Router();

export default function (TMDB_KEY, formatMovieQuery) {
  // GET /search
  router.get("/", async (req, res) => {
    const query = req.query.search_query;
    const refquery = formatMovieQuery(query);
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${refquery}`;

    try {
      const response = await axios.get(url);
      const movies = response.data.results;
      res.render("search", { movies, see: query });
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed");
    }
  });

  return router;
};
