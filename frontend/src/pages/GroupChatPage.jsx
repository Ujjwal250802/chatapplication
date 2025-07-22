import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, getGroupDetails } from "../lib/api";

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
import { VideoIcon, ArrowLeftIcon, Users2Icon, CreditCardIcon } from "lucide-react";

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

  if (loading || !chatClient || !channel || !groupDetails) return <ChatLoader />;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Chat client={chatClient} theme="str-chat__theme-light">
        <Channel channel={channel}>
          {/* Custom Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Link to="/groups" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeftIcon className="size-5 text-gray-600" />
              </Link>
              <div className="avatar size-10">
                <img src={groupDetails.groupPic} alt={groupDetails.name} className="rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{groupDetails.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Users2Icon className="size-3" />
                  {groupDetails.members.length} members, 1 online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleVideoCall} 
                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1"
                title="Start Group Video Call"
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

export default GroupChatPage;