import { useState, useEffect } from "react";
import { MessageInput } from "stream-chat-react";
import PaymentButton from "./PaymentButton";
import useAuthUser from "../hooks/useAuthUser";

const CustomMessageInput = ({ channel }) => {
  const { authUser } = useAuthUser();

  const handlePaymentSuccess = async (paymentData) => {
    try {
      console.log("✅ Payment Success Callback Triggered", paymentData);

      if (!channel || !authUser) {
        console.error("❌ Channel or authUser not available", { channel, authUser });
        return;
      }

      const currentTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // 🔹 Send a simple test message first
      await channel
        .sendMessage({
          text: `✅ Paid ₹${paymentData.amount} to ${paymentData.recipientName}`,
        })
        .then(() => console.log("✅ Test message sent"))
        .catch((err) => console.error("❌ Failed to send test message", err));

      // 🔹 Send detailed payment confirmation message
      await channel
        .sendMessage({
          text: `💰 Payment Sent Successfully! ✅\n\n💵 Amount: ₹${paymentData.amount}\n👤 To: ${paymentData.recipientName}\n🏦 UPI: ${paymentData.upiId}\n🆔 Transaction ID: ${paymentData.payment_id}\n📅 Time: ${currentTime}`,
          type: "payment_confirmation",
          payment_details: {
            amount: paymentData.amount,
            recipient_name: paymentData.recipientName,
            recipient_upi: paymentData.upiId,
            transaction_id: paymentData.payment_id,
            order_id: paymentData.order_id,
            sender_name: authUser?.fullName || "Unknown",
            timestamp: paymentData.timestamp,
            status: "completed",
            type: "sent",
          },
          attachments: [
            {
              type: "payment",
              title: "💰 Payment Confirmation",
              color: "#10B981",
              fields: [
                {
                  title: "Amount",
                  value: `₹${paymentData.amount}`,
                  short: true,
                },
                {
                  title: "Recipient",
                  value: paymentData.recipientName,
                  short: true,
                },
                {
                  title: "UPI ID",
                  value: paymentData.upiId,
                  short: true,
                },
                {
                  title: "Transaction ID",
                  value: paymentData.payment_id,
                  short: true,
                },
              ],
              footer: `Sent via ChatSphere • ${currentTime}`,
              footer_icon: "✅",
            },
          ],
        })
        .then(() => console.log("✅ Rich payment message sent"))
        .catch((error) => {
          console.error("❌ Failed to send rich payment message:", error);
        });

      // 🔹 Send recipient notification (delayed)
      setTimeout(() => {
        channel
          .sendMessage({
            text: `🔔 Payment Received! ✅\n\n💵 ₹${paymentData.amount} from ${authUser?.fullName || "Unknown"}\n🆔 TXN: ${paymentData.payment_id}`,
            type: "payment_notification",
            payment_details: {
              ...paymentData,
              sender_name: authUser?.fullName || "Unknown",
              type: "received",
              status: "completed",
              timestamp: paymentData.timestamp,
            },
          })
          .then(() => console.log("✅ Recipient notified"))
          .catch((err) =>
            console.error("❌ Error sending recipient message", err)
          );
      }, 1000);
    } catch (error) {
      console.error("❌ Error in handlePaymentSuccess:", error);
    }
  };

  // 🔁 Optional: test auto-message on mount (debug only)
  // useEffect(() => {
  //   if (channel) {
  //     channel.sendMessage({ text: "🧪 Hello from useEffect" });
  //   }
  // }, [channel]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 p-2 bg-base-200 border-t border-base-300">
        <div className="flex-1">
          <MessageInput focus />
        </div>
        <div className="flex items-center gap-2">
          <PaymentButton onSuccess={handlePaymentSuccess} />
        </div>
      </div>
    </div>
  );
};

export default CustomMessageInput;
