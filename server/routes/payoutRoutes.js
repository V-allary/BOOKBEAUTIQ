import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  getBankList,
  verifyBankAccount,
  setupPayoutAccount,
} from "../controllers/payoutController.js";

const router = express.Router();

router.get("/banks", authMiddleware, roleMiddleware("business", "admin"), getBankList);
router.post("/verify-account", authMiddleware, roleMiddleware("business", "admin"), verifyBankAccount);
router.post("/setup", authMiddleware, roleMiddleware("business", "admin"), setupPayoutAccount);

export default router;
