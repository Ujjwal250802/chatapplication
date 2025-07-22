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

  const handlePayment = (amount) => {
    if (channel && amount > 0) {
      channel.sendMessage({
        text: `💰 Payment sent: $${amount}`,
        attachments: [{
          type: 'payment',
          title: 'Payment Sent',
          text: `$${amount} has been sent`,
          color: '#00BCD4'
        }]
      });
      
      setShowPayModal(false);
      toast.success(`Payment of $${amount} sent successfully!`);
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Chat client={chatClient} theme="str-chat__theme-light">
        <Channel channel={channel}>
          {/* Custom Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeftIcon className="size-5 text-gray-600" />
              </Link>
              {targetUser && (
                <>
                  <div className="avatar size-10">
                    <img 
                      src={targetUser.image || targetUser.profilePic} 
                      alt={targetUser.name || targetUser.fullName}
                      className="rounded-full" 
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{targetUser.name || targetUser.fullName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span className="size-2 rounded-full bg-green-500 inline-block" />
                      2 members, 1 online
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleVideoCall} 
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                title="Start Video Call"
              >
                <VideoIcon className="size-4" />
                Start Call
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col bg-gray-50 relative">
            <Window>
              <MessageList />
              
              {/* Custom Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <MessageInput />
                  </div>
                  <button 
                    onClick={() => setShowPayModal(true)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <CreditCardIcon className="size-4" />
                    Pay
                  </button>
                </div>
              </div>
            </Window>
            <Thread />
          </div>
        </Channel>
      </Chat>

      {/* Payment Modal */}
      {showPayModal && (
        <PaymentModal 
          onClose={() => setShowPayModal(false)}
          onPay={handlePayment}
          recipientName={targetUser?.name || targetUser?.fullName}
        />
      )}
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ onClose, onPay, recipientName }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payAmount = parseFloat(amount);
    if (payAmount > 0) {
      onPay(payAmount);
    } else {
      toast.error('Please enter a valid amount');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Send Payment</h3>
        <p className="text-gray-600 mb-4">Send money to {recipientName}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="What's this for?"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CreditCardIcon className="size-4" />
              Send ${amount || '0.00'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;