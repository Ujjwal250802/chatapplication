import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import { VideoIcon, ArrowLeftIcon, CreditCardIcon, PlusIcon, SmileIcon, SendIcon } from "lucide-react";

import "stream-chat-react/dist/css/v2/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

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
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `🎥 I've started a video call. Join me here: ${callUrl}`,
      });

      // Open the call in a new window/tab
      window.open(callUrl, '_blank');
      toast.success("Video call started!");
    }
  };

  const handlePayment = (amount, credentials) => {
    if (channel && amount > 0) {
      // Simulate Razorpay payment process
      const paymentData = {
        amount: amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1
      };

      // Send payment message to chat
      channel.sendMessage({
        text: `💰 Payment of ₹${amount} sent via Razorpay`,
        attachments: [{
          type: 'payment',
          title: 'Payment Sent',
          text: `₹${amount} has been sent`,
          color: '#00BCD4'
        }]
      });
      
      setShowPayModal(false);
      toast.success(`Payment of ₹${amount} sent successfully!`);
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Chat client={chatClient} theme="str-chat__theme-light">
        <Channel channel={channel}>
          {/* Modern Header Design */}
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <ArrowLeftIcon className="size-5 text-gray-600" />
              </Link>
              {targetUser && (
                <>
                  <div className="relative">
                    <div className="avatar size-10">
                      <img 
                        src={targetUser.image || targetUser.profilePic} 
                        alt={targetUser.name || targetUser.fullName}
                        className="rounded-full" 
                      />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{targetUser.name || targetUser.fullName}</h3>
                    <p className="text-xs text-gray-500">2 members, 1 online</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleVideoCall} 
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                title="Start Video Call"
              >
                <VideoIcon className="size-4" />
                Start Call
              </button>
            </div>
          </div>

          {/* Chat Content with Modern Design */}
          <div className="flex-1 flex flex-col bg-white relative">
            <Window>
              <MessageList />
              
              {/* Modern Message Input */}
              <div className="bg-white border-t border-gray-100 p-4">
                <div className="flex items-end gap-3">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <PlusIcon className="size-5" />
                  </button>
                  
                  <div className="flex-1 relative bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-300 transition-colors">
                    <div className="px-4 py-3">
                      <MessageInput />
                    </div>
                  </div>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <SmileIcon className="size-5" />
                  </button>
                  
                  <button 
                    onClick={() => setShowPayModal(true)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                  >
                    Pay
                  </button>
                </div>
              </div>
            </Window>
            <Thread />
          </div>
        </Channel>
      </Chat>

      {/* Razorpay Payment Modal */}
      {showPayModal && (
        <RazorpayPaymentModal 
          onClose={() => setShowPayModal(false)}
          onPay={handlePayment}
          recipientName={targetUser?.name || targetUser?.fullName}
        />
      )}
    </div>
  );
};

// Razorpay Payment Modal Component
const RazorpayPaymentModal = ({ onClose, onPay, recipientName }) => {
  const [amount, setAmount] = useState('');
  const [credentials, setCredentials] = useState({
    email: '',
    phone: ''
  });
  const [showCredentials, setShowCredentials] = useState(false);

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    const payAmount = parseFloat(amount);
    if (payAmount > 0) {
      setShowCredentials(true);
    } else {
      toast.error('Please enter a valid amount');
    }
  };

  const handleFinalPayment = (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.phone) {
      toast.error('Please fill in all credentials');
      return;
    }

    // Simulate opening Razorpay
    toast.success('Opening Razorpay payment gateway...');
    
    // Simulate payment processing
    setTimeout(() => {
      onPay(parseFloat(amount), credentials);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {!showCredentials ? (
          <>
            <div className="text-center mb-6">
              <div className="size-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCardIcon className="size-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Send Payment</h3>
              <p className="text-gray-600 mt-1">Send money to {recipientName}</p>
            </div>
            
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-lg font-medium"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors font-medium"
                >
                  Continue
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="size-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="size-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Razorpay Payment</h3>
              <p className="text-gray-600 mt-1">Enter your details to proceed</p>
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <p className="text-lg font-semibold text-gray-900">₹{amount}</p>
                <p className="text-sm text-gray-600">to {recipientName}</p>
              </div>
            </div>
            
            <form onSubmit={handleFinalPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={credentials.phone}
                  onChange={(e) => setCredentials(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCredentials(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="size-4" />
                  Pay ₹{amount}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;