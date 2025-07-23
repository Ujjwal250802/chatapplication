import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  Chat,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CustomMessageInput from "../components/CustomMessageInput";
import PaymentMessage from "../components/PaymentMessage";
import { VideoIcon, ArrowLeftIcon, PhoneIcon } from "lucide-react";

import "stream-chat-react/dist/css/v2/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState(null);

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

  // Custom message renderer
  const customMessageRenderer = (message, index) => {
    if (message.type === "payment_confirmation" || message.type === "payment_notification") {
      return <PaymentMessage key={message.id || index} message={message} />;
    }
    return null;
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 to-green-100">
      <Chat client={chatClient} theme="str-chat__theme-light">
        <Channel 
          channel={channel}
          Message={customMessageRenderer}
        >
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
              <CustomMessageInput channel={channel} />
            </Window>
            <Thread />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;