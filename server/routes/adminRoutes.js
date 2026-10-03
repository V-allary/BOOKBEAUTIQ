import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  listCustomers,
  getCustomerDetail,
  suspendCustomer,
  reinstateCustomer,
} from "../controllers/adminController.js";
import {
  getReportSummary,
  listReports,
  getReportDetail,
  updateReportStatus,
} from "../controllers/reportController.js";

import {
  listPlatformReviews,
  updatePlatformReviewStatus,
} from "../controllers/platformReviewController.js";

const router = express.Router();

// Everything under /api/admin is admin-only
router.use(authMiddleware, roleMiddleware("admin"));

router.get("/customers", listCustomers);
router.get("/customers/:id", getCustomerDetail);
router.patch("/customers/:id/suspend", suspendCustomer);
router.patch("/customers/:id/reinstate", reinstateCustomer);

// "summary" must come before "/:id" or it would be read as an ID
router.get("/reports/summary", getReportSummary);
router.get("/reports", listReports);
router.get("/reports/:id", getReportDetail);
router.patch("/reports/:id/status", updateReportStatus);

router.get("/platform-reviews", listPlatformReviews);
router.patch("/platform-reviews/:id/status", updatePlatformReviewStatus);

export default router;