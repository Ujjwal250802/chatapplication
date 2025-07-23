import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createPaymentOrder, verifyPayment } from "../lib/api";
import toast from "react-hot-toast";

const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createOrderMutation = useMutation({
    mutationFn: createPaymentOrder,
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create payment order");
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: verifyPayment,
    onError: (error) => {
      toast.error(error.response?.data?.message || "Payment verification failed");
    },
  });

  const initiatePayment = async (paymentData, onSuccess) => {
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
      const orderData = await createOrderMutation.mutateAsync(paymentData.amount);
      if (!orderData.success) {
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
            const verificationData = await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verificationData.success) {
              toast.success("💰 Payment successful!");
              
              onSuccess?.({
                ...verificationData,
                amount: paymentData.amount,
                recipientName: paymentData.recipientName,
                upiId: paymentData.upiId,
                timestamp: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error("Payment verification error:", error);
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

  return {
    initiatePayment,
    isProcessing,
    createOrderMutation,
    verifyPaymentMutation,
  };
};

export default usePayment;