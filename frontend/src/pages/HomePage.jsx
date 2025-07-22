import { useQuery } from "@tanstack/react-query";
import { getUserGroups, getRecommendedUsers } from "../lib/api";
import { Link } from "react-router";
import { Users2Icon, MessageSquareIcon, VideoIcon, UsersIcon } from "lucide-react";

const HomePage = () => {
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: getUserGroups,
  });

  const { data: recommendedUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: getRecommendedUsers,
  });

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

        {/* Recent Groups Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users2Icon className="size-5 text-primary" />
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
              <UsersIcon className="size-5 text-secondary" />
              Discover Language Partners
            </h2>
          </div>

          {usersLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : recommendedUsers && recommendedUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedUsers.slice(0, 8).map((user) => (
                <div key={user._id} className="card bg-base-200 hover:shadow-md transition-shadow">
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar size-10">
                        <img src={user.profilePic} alt={user.fullName} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm truncate">{user.fullName}</h3>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="badge badge-secondary badge-xs">
                        {user.nativeLanguage}
                      </span>
                      <span className="badge badge-outline badge-xs">
                        {user.learningLanguage}
                      </span>
                    </div>
                    <Link to={`/chat/${user._id}`} className="btn btn-outline btn-sm w-full">
                      Connect
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UsersIcon className="size-12 mx-auto text-base-content opacity-40 mb-3" />
              <p className="text-base-content opacity-70">
                No language partners found at the moment.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default HomePage;
