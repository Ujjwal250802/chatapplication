import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_uO9KUIRRmFD0rp",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "ZsmuBYvapWYZ4IkpMRWCZWpo",
});

export async function createPaymentOrder(req, res) {
  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount. Amount must be at least ₹1",
      });
    }

    // Generate a shorter receipt ID (max 40 characters)
    const timestamp = Date.now().toString();
    const userIdShort = req.user._id.toString().slice(-8); // Last 8 characters of user ID
    const receipt = `rcpt_${timestamp}_${userIdShort}`.slice(0, 40); // Ensure max 40 chars

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt,
      payment_capture: 1,
    };

    console.log("Creating order with options:", options);

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      message: "Payment order created successfully"
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification data",
      });
    }

    // Create signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "ZsmuBYvapWYZ4IkpMRWCZWpo")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed - Invalid signature",
      });
    }

    // Payment is verified successfully
    // Here you can save payment details to database if needed
    
    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      verified_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

// Get payment details (optional endpoint for transaction history)
export async function getPaymentDetails(req, res) {
  try {
    const { payment_id } = req.params;
    
    const payment = await razorpay.payments.fetch(payment_id);
    
    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details"
    });
  }
}