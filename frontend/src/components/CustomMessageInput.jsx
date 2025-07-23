import { MessageInput } from "stream-chat-react";
import PaymentButton from "./PaymentButton";
import { PlusIcon, SmileIcon } from "lucide-react";
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

      // Send payment confirmation message
      await channel.sendMessage({
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
      });

      // Send recipient notification (delayed)
      setTimeout(() => {
        channel.sendMessage({
          text: `🔔 Payment Received! ✅\n\n💵 ₹${paymentData.amount} from ${authUser?.fullName || "Unknown"}\n🆔 TXN: ${paymentData.payment_id}`,
          type: "payment_notification",
          payment_details: {
            ...paymentData,
            sender_name: authUser?.fullName || "Unknown",
            type: "received",
            status: "completed",
            timestamp: paymentData.timestamp,
          },
        });
      }, 1000);
    } catch (error) {
      console.error("❌ Error in handlePaymentSuccess:", error);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
      <div className="flex items-center gap-3 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2">
        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <PlusIcon className="size-5" />
        </button>
        
        <div className="flex-1 min-h-[40px] flex items-center">
          <MessageInput 
            focus={false}
            placeholder="Type your message"
            additionalTextareaProps={{
              style: {
                border: 'none',
                outline: 'none',
                resize: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                padding: '8px 0',
                minHeight: '24px',
                maxHeight: '120px'
              }
            }}
          />
        </div>
        
        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <SmileIcon className="size-5" />
        </button>
        
        <PaymentButton onSuccess={handlePaymentSuccess} />
      </div>
    </div>
  );
};

export default CustomMessageInput;