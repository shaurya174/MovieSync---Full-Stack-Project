// routes/trending.js
import express from "express";
import axios from "axios";

const router = express.Router();

export default function (TMDB_KEY, genreList) {
  // GET /trending
  router.get("/", async (req, res) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_KEY}`
      );
      const movies = response.data.results;
      const ids = movies.map((movie) =>
        movie.genre_ids.map((id) => genreList[id]).join(", ")
      );
      res.render("trending", { movies, ids });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Failed");
    }
  });

  // GET /trending/sort/popularity
  router.get("/sort/popularity", async (req, res) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&sort_by=popularity.desc&page=1`
      );
      const movies = response.data.results;
      const ids = movies.map((movie) =>
        movie.genre_ids.map((id) => genreList[id]).join(", ")
      );
      res.render("sort_trending_pop", { movies, ids });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Failed");
    }
  });

  // GET /trending/sort/release
  router.get("/sort/release", async (req, res) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&sort_by=release_date.desc&page=1`
      );
      const movies = response.data.results;
      const ids = movies.map((movie) =>
        movie.genre_ids.map((id) => genreList[id]).join(", ")
      );
      res.render("sort_trending_rel", { movies, ids });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Failed");
    }
  });

  return router;
};
