import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { toggleSaveBusiness, getMySavedBusinesses } from "../controllers/savedBusinessController.js";

const router = express.Router();

router.patch("/:businessId/toggle", authMiddleware, toggleSaveBusiness);
router.get("/", authMiddleware, getMySavedBusinesses);

export default router;
