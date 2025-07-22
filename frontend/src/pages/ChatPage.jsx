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
import { VideoIcon, ArrowLeftIcon, CreditCardIcon } from "lucide-react";

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
                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1"
                title="Start Video Call"
              >
                <VideoIcon className="size-4" />
                <span className="text-sm font-medium">Start Call</span>
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col bg-gray-50">
            <Window>
              <MessageList />
              
              {/* Custom Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <div className="str-chat__message-input-wrapper">
                      <MessageInput />
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
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
    </div>
  );
};

export default ChatPage;