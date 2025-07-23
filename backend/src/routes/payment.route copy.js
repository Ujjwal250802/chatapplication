import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  createPaymentOrder, 
  verifyPayment, 
  getPaymentDetails 
} from "../controllers/payment.controller.js";

const router = express.Router();
// Apply auth middleware to all routes
router.use(protectRoute);
// Create payment order
router.post("/create-order", createPaymentOrder);
// Verify payment
router.post("/verify", verifyPayment);
// Get payment details (optional)
router.get("/details/:payment_id", getPaymentDetails);

export default router;