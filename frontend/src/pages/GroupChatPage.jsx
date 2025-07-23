import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, getGroupDetails } from "../lib/api";

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
import { VideoIcon, ArrowLeftIcon, Users2Icon } from "lucide-react";

import "stream-chat-react/dist/css/v2/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const GroupChatPage = () => {
  const { id: groupId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const { data: groupDetails } = useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: () => getGroupDetails(groupId),
    enabled: !!groupId,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !groupDetails) return;

      try {
        console.log("Initializing group chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const memberIds = groupDetails.members.map(member => member._id);

        const currChannel = client.channel("messaging", groupDetails.streamChannelId, {
          name: groupDetails.name,
          image: groupDetails.groupPic,
          members: memberIds,
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing group chat:", error);
        toast.error("Could not connect to group chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, groupDetails]);

  const handleVideoCall = () => {
    if (channel && groupDetails) {
      const callUrl = `${window.location.origin}/group-call/${groupDetails.streamChannelId}`;

      channel.sendMessage({
        text: `🎥 Group video call started! Join here: ${callUrl}`,
      });

      // Open the call in a new window/tab
      window.open(callUrl, '_blank');
      toast.success("Video call link sent to group!");
    }
  };

  // Custom message renderer
  const customMessageRenderer = (message, index) => {
    if (message.type === "payment_confirmation" || message.type === "payment_notification") {
      return <PaymentMessage key={message.id || index} message={message} />;
    }
    return null;
  };

  if (loading || !chatClient || !channel || !groupDetails) return <ChatLoader />;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      <Chat client={chatClient} theme="str-chat__theme-light">
        <Channel 
          channel={channel}
          Message={customMessageRenderer}
        >
          {/* Clean Header */}
          <div className="bg-white/90 backdrop-blur-sm border-b border-blue-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Link to="/groups" className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                <ArrowLeftIcon className="size-5 text-gray-600" />
              </Link>
              <div className="avatar size-10">
                <img src={groupDetails.groupPic} alt={groupDetails.name} className="rounded-full border-2 border-blue-200" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{groupDetails.name}</h3>
                <p className="text-sm text-blue-600 flex items-center gap-1">
                  <Users2Icon className="size-3" />
                  {groupDetails.members.length} members, 1 online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleVideoCall} 
                className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-lg"
                title="Start Group Video Call"
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

export default GroupChatPage;