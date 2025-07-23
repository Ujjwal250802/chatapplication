import express from "express";
import { createPaymentOrder, verifyPayment } from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);

export default router;