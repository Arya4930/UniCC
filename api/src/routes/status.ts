import express from "express";
import type { Router } from "express";

const router: Router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ text: "API is working" });
});

export default router;
