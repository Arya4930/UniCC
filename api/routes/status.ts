import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ text: "API is working" });
});

export default router;
