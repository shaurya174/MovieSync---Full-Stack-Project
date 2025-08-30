// routes/news.js
import express from "express";
import axios from "axios";

const router = express.Router();

export default function (NEWS_API_KEY) {
  // GET /news
  router.get("/", async (req, res) => {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=movies&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
      );
      const articles = response.data.articles;
      res.render("news", { newsss: articles });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Failed");
    }
  });

  return router;
};
