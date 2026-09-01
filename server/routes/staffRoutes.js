import express from "express";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public — customers can view staff
router.get("/", getStaff);

// Protected — login required
 

router.post("/", authMiddleware, roleMiddleware("business", "admin"), createStaff);
router.put("/:id", authMiddleware, roleMiddleware("business", "admin"), updateStaff);
router.delete("/:id", authMiddleware, roleMiddleware("business", "admin"), deleteStaff);

export default router;