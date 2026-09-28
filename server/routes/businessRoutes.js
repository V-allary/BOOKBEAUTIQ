import express from "express";
import roleMiddleware from "../middleware/roleMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireVerifiedOwner from "../middleware/requireVerifiedOwner.js";

import {
  getBusinesses,
  getApprovedBusinesses,
  searchBusinesses,
  getBusinessById,
  getBusinessForOwner,
  createBusiness,
  deleteBusiness,
  updateBusiness,
  approveBusiness,
  rejectBusiness,
  getPublicStats,
} from "../controllers/businessController.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// All businesses 
router.get("/", authMiddleware, roleMiddleware("admin"), getBusinesses);

 
router.get("/approved", getApprovedBusinesses);
 
router.get("/search", searchBusinesses);
 
router.get("/stats", getPublicStats);

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
 
router.get("/:id", getBusinessById);

// ==========================================
// BUSINESS CREATION
// Owner account must already be verified
// ==========================================

router.post(
  "/", authMiddleware,
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