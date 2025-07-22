import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserGroups, getRecommendedUsers, getUserFriends, sendFriendRequest, getOutgoingFriendReqs } from "../lib/api";
import { Link } from "react-router";
import { Users2Icon, MessageSquareIcon, VideoIcon, UsersIcon, UserPlusIcon } from "lucide-react";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import toast from "react-hot-toast";

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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Welcome to ChatSphere
          </h1>
          <p className="text-base-content opacity-70">
            Connect with language partners and practice together
          </p>
        </div>

        {/* Friends Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UsersIcon className="size-5 text-primary" />
              Your Friends
            </h2>
            <Link to="/friends" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>

          {friendsLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
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

        {/* Recent Groups Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users2Icon className="size-5 text-secondary" />
              Your Groups
            </h2>
            <Link to="/groups" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>

          {groupsLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.slice(0, 6).map((group) => (
                <div key={group._id} className="card bg-base-200 hover:shadow-md transition-shadow">
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar size-10">
                        <img src={group.groupPic} alt={group.name} className="rounded-full" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold truncate">{group.name}</h3>
                        <p className="text-xs text-base-content opacity-70">
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
            <div className="text-center py-8">
              <Users2Icon className="size-12 mx-auto text-base-content opacity-40 mb-3" />
              <p className="text-base-content opacity-70">
                No groups yet. <Link to="/groups" className="link link-primary">Create your first group!</Link>
              </p>
            </div>
          )}
        </section>

        {/* Discover People Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserPlusIcon className="size-5 text-accent" />
              Discover Language Partners
            </h2>
          </div>

          {usersLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : recommendedUsers && recommendedUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recommendedUsers.slice(0, 8).map((user) => (
                <div key={user._id} className="card bg-base-200 hover:shadow-md transition-shadow">
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar size-12">
                        <img src={user.profilePic} alt={user.fullName} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold truncate">{user.fullName}</h3>
                        <p className="text-xs text-base-content opacity-70 truncate">
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
            <div className="text-center py-8">
              <UserPlusIcon className="size-12 mx-auto text-base-content opacity-40 mb-3" />
              <p className="text-base-content opacity-70">
                No language partners found at the moment.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;