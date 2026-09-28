import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  listCustomers,
  getCustomerDetail,
  suspendCustomer,
  reinstateCustomer,
} from "../controllers/adminController.js";

const router = express.Router();

// Everything under /api/admin is admin-only
router.use(authMiddleware, roleMiddleware("admin"));

router.get("/customers", listCustomers);
router.get("/customers/:id", getCustomerDetail);
router.patch("/customers/:id/suspend", suspendCustomer);
router.patch("/customers/:id/reinstate", reinstateCustomer);

export default router;