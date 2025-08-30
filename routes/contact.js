// routes/contact.js
import express from "express";
const router = express.Router();

// GET /contact
router.get("/", (req, res) => {
  res.render("contact");
});

export default router;
