import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, getGroupDetails } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import { VideoIcon, ArrowLeftIcon, Users2Icon } from "lucide-react";

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

      toast.success("Video call link sent to group!");
    }
  };

  if (loading || !chatClient || !channel || !groupDetails) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            {/* Custom Header */}
            <div className="p-3 border-b flex items-center justify-between max-w-7xl mx-auto w-full bg-base-200">
              <div className="flex items-center gap-3">
                <Link to="/groups" className="btn btn-ghost btn-sm">
                  <ArrowLeftIcon className="size-4" />
                </Link>
                <div className="avatar size-10">
                  <img src={groupDetails.groupPic} alt={groupDetails.name} className="rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold">{groupDetails.name}</h3>
                  <p className="text-xs text-base-content opacity-70 flex items-center gap-1">
                    <Users2Icon className="size-3" />
                    {groupDetails.members.length} members
                  </p>
                </div>
              </div>
              <button onClick={handleVideoCall} className="btn btn-success btn-sm text-white">
                <VideoIcon className="size-5" />
                Start Call
              </button>
            </div>

            <Window>
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default GroupChatPage;