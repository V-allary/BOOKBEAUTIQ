import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMyReferral } from "../controllers/referralController.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyReferral);

export default router;