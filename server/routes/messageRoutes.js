import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import optionalAuth from "../middleware/optionalAuth.js";
import {
  sendCustomerMessage,
  sendBusinessMessage,
  getCustomerConversation,
  getBusinessConversation,
  listBusinessConversations,
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/customer", optionalAuth, sendCustomerMessage);
router.get("/customer/:businessId", optionalAuth, getCustomerConversation);

router.post("/business", authMiddleware, roleMiddleware("business", "admin"), sendBusinessMessage);
router.get(
  "/business/:businessId/:customerEmail",
  authMiddleware,
  roleMiddleware("business", "admin"),
  getBusinessConversation
);
router.get(
  "/business/:businessId",
  authMiddleware,
  roleMiddleware("business", "admin"),
  listBusinessConversations
);

export default router;
