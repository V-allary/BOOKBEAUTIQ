import express from "express";

import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public — customers can view services
router.get("/", getServices);

// Protected — business owner or admin only
router.post("/", authMiddleware, roleMiddleware("business", "admin"), createService);
router.put("/:id", authMiddleware, roleMiddleware("business", "admin"), updateService);
router.delete("/:id", authMiddleware, roleMiddleware("business", "admin"), deleteService);

export default router;