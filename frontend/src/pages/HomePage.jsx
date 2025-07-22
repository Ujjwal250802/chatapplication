import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserGroups, getRecommendedUsers, getUserFriends, sendFriendRequest, getOutgoingFriendReqs } from "../lib/api";
import { Link } from "react-router-dom";
import { Users2Icon, MessageSquareIcon, VideoIcon, UsersIcon, UserPlusIcon } from "lucide-react";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import toast from "react-hot-toast";
import Chatbot from "../components/chatBot";

const HomePage = () => {
  const queryClient = useQueryClient();

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: getUserGroups,
  });

  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingRequests } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendFriendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success("Friend request sent!");
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send friend request");
    },
  });

  const outgoingRequestIds = outgoingRequests?.map(req => req.recipient._id) || [];

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-base-content">
            Welcome to ChatSphere
          </h1>
          <p className="text-base-content/70 text-lg">
            Connect with language partners and practice together
          </p>
        </div>

        <div className="space-y-12">
          {/* Friends Section */}
          <section className="bg-base-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-base-content">
                <UsersIcon className="size-6 text-primary" />
                Your Friends
              </h2>
              <Link to="/friends" className="btn btn-outline btn-sm">
                View All
              </Link>
            </div>

            {friendsLoading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : friends && friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {friends.slice(0, 8).map((friend) => (
                  <FriendCard key={friend._id} friend={friend} />
                ))}
              </div>
            ) : (
              <NoFriendsFound />
            )}
          </section>

          {/* Groups Section */}
          <section className="bg-base-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-base-content">
                <Users2Icon className="size-6 text-secondary" />
                Your Groups
              </h2>
              <Link to="/groups" className="btn btn-outline btn-sm">
                View All
              </Link>
            </div>

            {groupsLoading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : groups && groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.slice(0, 6).map((group) => (
                  <div key={group._id} className="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="card-body p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="avatar size-12">
                          <img src={group.groupPic} alt={group.name} className="rounded-full" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base-content truncate">{group.name}</h3>
                          <p className="text-sm text-base-content/70">
                            {group.members.length} members
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/group-chat/${group._id}`}
                          className="btn btn-primary btn-sm flex-1"
                        >
                          <MessageSquareIcon className="size-4 mr-1" />
                          Chat
                        </Link>
                        <Link
                          to={`/group-call/${group.streamChannelId}`}
                          className="btn btn-success btn-sm"
                        >
                          <VideoIcon className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users2Icon className="size-16 mx-auto text-base-content/40 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-base-content">No groups yet</h3>
                <p className="text-base-content/70 mb-4">
                  Create your first group to start chatting with multiple friends!
                </p>
                <Link to="/groups" className="btn btn-primary">
                  Create Your First Group
                </Link>
              </div>
            )}
          </section>

          {/* Discover People Section */}
          <section className="bg-base-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-base-content">
                <UserPlusIcon className="size-6 text-accent" />
                Discover Language Partners
              </h2>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : recommendedUsers && recommendedUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recommendedUsers.slice(0, 8).map((user) => (
                  <div key={user._id} className="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="card-body p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="avatar size-12">
                          <img src={user.profilePic} alt={user.fullName} className="rounded-full" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base-content truncate">{user.fullName}</h3>
                          <p className="text-sm text-base-content/70 truncate">
                            {user.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="badge badge-secondary text-xs">
                          Native: {user.nativeLanguage}
                        </span>
                        <span className="badge badge-outline text-xs">
                          Learning: {user.learningLanguage}
                        </span>
                      </div>

                      <button
                        onClick={() => sendFriendRequestMutation(user._id)}
                        disabled={isPending || outgoingRequestIds.includes(user._id)}
                        className="btn btn-outline btn-sm w-full"
                      >
                        {outgoingRequestIds.includes(user._id) ? (
                          "Request Sent"
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-1" />
                            Add Friend
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserPlusIcon className="size-16 mx-auto text-base-content/40 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-base-content">No language partners found</h3>
                <p className="text-base-content/70">
                  Check back later for new language learning partners.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default HomePage;