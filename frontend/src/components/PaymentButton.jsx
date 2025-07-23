import { useState } from "react";
import { CreditCard, Loader2, X, IndianRupee, Send } from "lucide-react";
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
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_uO9KUIRRmFD0rp",
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
          color: "#10B981",
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
        className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-all duration-200 flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
        title="Send Payment"
      >
        <CreditCard className="size-4" />
        Pay
      </button>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg">
                  <CreditCard className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Send Payment</h3>
                  <p className="text-sm text-gray-600">Quick and secure transfer</p>
                </div>
              </div>
              <button
                onClick={handleModalClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>Recipient Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={paymentData.recipientName}
                  onChange={handleInputChange}
                  placeholder="Enter recipient's name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>UPI ID</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={paymentData.upiId}
                  onChange={handleInputChange}
                  placeholder="example@upi"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>Amount</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="size-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    name="amount"
                    value={paymentData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Amount Preview */}
              {paymentData.amount && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">You're sending</span>
                    <span className="text-2xl font-bold text-emerald-600">₹{paymentData.amount}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    To: {paymentData.recipientName || "Recipient"}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={handleModalClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing || !paymentData.amount || !paymentData.upiId || !paymentData.recipientName}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
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