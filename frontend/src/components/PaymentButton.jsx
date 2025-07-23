import { useState } from "react";
import { CreditCard, Loader2, X, IndianRupee } from "lucide-react";
import { createPaymentOrder, verifyPayment } from "../lib/api";
import toast from "react-hot-toast";

const PaymentButton = ({ onSuccess, disabled = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    upiId: "",
    recipientName: ""
  });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
    
  const handlePaymentClick = () => {
    setShowPaymentModal(true);
  };

  const handleModalClose = () => {
    setShowPaymentModal(false);
    setPaymentData({ amount: "", upiId: "", recipientName: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    if (!paymentData.amount || !paymentData.upiId || !paymentData.recipientName) {
      toast.error("Please fill in all fields");
      return;
    }

    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      // Create order
      const orderData = await createPaymentOrder(amount);
      if (!orderData.success) {
        toast.error(orderData.message || "Failed to create payment order");
        return;
      }

      const options = {
        key: "rzp_test_uO9KUIRRmFD0rp", // Your Razorpay key ID
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "ChatSphere Pay",
        description: `Payment to ${paymentData.recipientName}`,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            const verificationData = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verificationData.success) {
              toast.success("💰 Payment successful!");
              
              // Call the success callback with payment details
              onSuccess?.({
                ...verificationData,
                amount: amount,
                recipientName: paymentData.recipientName,
                upiId: paymentData.upiId,
                timestamp: new Date().toISOString()
              });
              
              handleModalClose();
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        notes: {
          recipient_name: paymentData.recipientName,
          recipient_upi: paymentData.upiId
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePaymentClick}
        disabled={disabled}
        className="btn btn-primary btn-sm gap-2 min-w-[80px]"
      >
        <CreditCard className="size-4" />
        Pay
      </button>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Send Payment</h3>
                  <p className="text-sm text-base-content/70">Quick and secure transfer</p>
                </div>
              </div>
              <button
                onClick={handleModalClose}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Recipient Name</span>
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={paymentData.recipientName}
                  onChange={handleInputChange}
                  placeholder="Enter recipient's name"
                  className="input input-bordered w-full focus:input-primary"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">UPI ID</span>
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={paymentData.upiId}
                  onChange={handleInputChange}
                  placeholder="example@upi"
                  className="input input-bordered w-full focus:input-primary"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Amount</span>
                </label>
                <div className="relative">
                  <IndianRupee className="size-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                  <input
                    type="number"
                    name="amount"
                    value={paymentData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    className="input input-bordered w-full pl-10 focus:input-primary"
                  />
                </div>
              </div>

              {/* Amount Preview */}
              {paymentData.amount && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-base-content/70">You're sending</span>
                    <span className="text-2xl font-bold text-primary">₹{paymentData.amount}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-base-300">
              <button
                onClick={handleModalClose}
                className="btn btn-ghost flex-1"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing || !paymentData.amount || !paymentData.upiId || !paymentData.recipientName}
                className="btn btn-primary flex-1 gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4" />
                    Pay ₹{paymentData.amount || "0"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentButton;