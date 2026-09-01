import express from "express";
import roleMiddleware from "../middleware/roleMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireVerifiedOwner from "../middleware/requireVerifiedOwner.js";

import {
  getBusinesses,
  getApprovedBusinesses,
  getBusinessById,
  getBusinessForOwner,
  createBusiness,
  deleteBusiness,
  updateBusiness,
  approveBusiness,
  rejectBusiness,
} from "../controllers/businessController.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// All businesses
// Used by Admin
router.get("/", getBusinesses);

// Approved + owner-verified businesses
// Used by Explore
router.get("/approved", getApprovedBusinesses);

router.get(
  "/owner",
  authMiddleware,
  roleMiddleware("business"),
  getBusinessForOwner
);

router.get(
  "/:id/owner",
  authMiddleware,
  roleMiddleware("business", "admin"),
  getBusinessForOwner
);

// Single approved + owner-verified business
// Used by Business Details
router.get("/:id", getBusinessById);

// ==========================================
// BUSINESS CREATION
// Owner account must already be verified
// ==========================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("business", "admin"),
  requireVerifiedOwner,
  createBusiness
);

// ==========================================
// PLATFORM APPROVAL
// ADMIN ONLY
// ==========================================

router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  approveBusiness
);

router.patch(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("admin"),
  rejectBusiness
);

// ==========================================
// BUSINESS MANAGEMENT
// ==========================================

router.put("/:id", authMiddleware, updateBusiness);

router.delete("/:id", authMiddleware, deleteBusiness);

export default router;
