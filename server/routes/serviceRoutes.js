import express from "express";

import {
  getServices,
  createService,
} from "../controllers/serviceController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public — customers can view services
router.get("/", getServices);

// Protected — login required
router.post("/", authMiddleware, createService);

router.post("/", authMiddleware, roleMiddleware("business", "admin"), createService);

export default router;