import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  Chat,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import PaymentButton from "../components/PaymentButton";
import PaymentMessage from "../components/PaymentMessage";
import { VideoIcon, ArrowLeftIcon, PlusIcon, SmileIcon } from "lucide-react";

import "stream-chat-react/dist/css/v2/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState(null);

  const { authUser } = useAuthUser();

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    retry: 3,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !STREAM_API_KEY) {
        console.log("Missing requirements:", { 
          token: !!tokenData?.token, 
          authUser: !!authUser, 
          apiKey: !!STREAM_API_KEY 
        });
        return;
      }

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        // Disconnect any existing connection
        if (client.user) {
          await client.disconnectUser();
        }

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        console.log("User connected successfully");

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        console.log("Channel watched successfully");

        // Get target user info from channel members
        const members = Object.values(currChannel.state.members);
        const targetMember = members.find(member => member.user.id !== authUser._id);
        if (targetMember) {
          setTargetUser(targetMember.user);
        }

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();

    // Cleanup function
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [tokenData, authUser, targetUserId, STREAM_API_KEY]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `🎥 I've started a video call. Join me here: ${callUrl}`,
      });

      window.open(callUrl, '_blank');
      toast.success("Video call started!");
    }
  };

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

  // Custom message renderer
  const Message = (props) => {
    if (props.message.type === "payment_confirmation" || props.message.type === "payment_notification") {
      return <PaymentMessage message={props.message} />;
    }
    return null;
  };

  if (loading || tokenLoading) return <ChatLoader />;

  if (!chatClient || !channel) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p>Failed to connect to chat. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 to-green-100">
      <Chat client={chatClient} theme="str-chat__theme-light">
        <Channel channel={channel} Message={Message}>
          {/* Clean Header Design */}
          <div className="bg-white/90 backdrop-blur-sm border-b border-green-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 hover:bg-green-50 rounded-full transition-colors">
                <ArrowLeftIcon className="size-5 text-gray-600" />
              </Link>
              {targetUser && (
                <>
                  <div className="relative">
                    <div className="avatar size-10">
                      <img 
                        src={targetUser.image || targetUser.profilePic} 
                        alt={targetUser.name || targetUser.fullName}
                        className="rounded-full border-2 border-green-200" 
                      />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{targetUser.name || targetUser.fullName}</h3>
                    <p className="text-xs text-green-600">2 members, 1 online</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleVideoCall} 
                className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-lg"
                title="Start Video Call"
              >
                <VideoIcon className="size-5" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col relative">
            <Window>
              <div className="flex-1 bg-white/50 backdrop-blur-sm">
                <MessageList />
              </div>
              
              {/* Custom Message Input */}
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
            </Window>
            <Thread />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;