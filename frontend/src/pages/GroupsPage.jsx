import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserGroups, createGroup, getUserFriends } from "../lib/api";
import { Link } from "react-router-dom";
import { PlusIcon, Users2Icon, VideoIcon, MessageSquareIcon } from "lucide-react";
import toast from "react-hot-toast";

const GroupsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: getUserGroups,
  });

  const { data: friends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { mutate: createGroupMutation, isPending } = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      toast.success("Group created successfully!");
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create group");
    },
  });

  if (groupsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Groups</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="size-5 mr-2" />
            Create Group
          </button>
        </div>

        {groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users2Icon className="size-16 mx-auto text-base-content opacity-40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
            <p className="text-base-content opacity-70 mb-4">
              Create your first group to start chatting with multiple friends!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <PlusIcon className="size-5 mr-2" />
              Create Your First Group
            </button>
          </div>
        )}

        {showCreateModal && (
          <CreateGroupModal
            friends={friends || []}
            onClose={() => setShowCreateModal(false)}
            onSubmit={createGroupMutation}
            isPending={isPending}
          />
        )}
      </div>
    </div>
  );
};

const GroupCard = ({ group }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={group.groupPic} alt={group.name} className="rounded-full" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold truncate">{group.name}</h3>
            <p className="text-sm text-base-content opacity-70">
              {group.members.length} members
            </p>
          </div>
        </div>

        {group.description && (
          <p className="text-sm text-base-content opacity-80 mb-3 line-clamp-2">
            {group.description}
          </p>
        )}

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
  );
};

const CreateGroupModal = ({ friends, onClose, onSubmit, isPending }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    members: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (formData.members.length === 0) {
      toast.error("Please select at least one member");
      return;
    }
    onSubmit(formData);
  };

  const toggleMember = (friendId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(friendId)
        ? prev.members.filter(id => id !== friendId)
        : [...prev.members, friendId]
    }));
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Create New Group</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Group Name *</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your group"
              rows={3}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Select Members *</span>
            </label>
            <div className="max-h-60 overflow-y-auto border border-base-300 rounded-lg p-2">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <label key={friend._id} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={formData.members.includes(friend._id)}
                      onChange={() => toggleMember(friend._id)}
                    />
                    <div className="avatar size-8">
                      <img src={friend.profilePic} alt={friend.fullName} className="rounded-full" />
                    </div>
                    <span className="flex-1">{friend.fullName}</span>
                  </label>
                ))
              ) : (
                <p className="text-center text-base-content opacity-70 py-4">
                  No friends available. Add friends first to create groups.
                </p>
              )}
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending || friends.length === 0}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupsPage;