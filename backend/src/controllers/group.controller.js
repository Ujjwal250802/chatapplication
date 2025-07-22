import Group from "../models/Group.js";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export async function createGroup(req, res) {
  try {
    const { name, description, members, groupPic } = req.body;
    const adminId = req.user._id;

    if (!name || !members || members.length === 0) {
      return res.status(400).json({ 
        message: "Group name and at least one member are required" 
      });
    }

    // Ensure admin is included in members
    const allMembers = [...new Set([adminId.toString(), ...members])];

    // Generate unique stream channel ID
    const streamChannelId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const group = await Group.create({
      name,
      description: description || "",
      groupPic: groupPic || `https://avatar.iran.liara.run/public/group/${Math.floor(Math.random() * 50) + 1}.png`,
      admin: adminId,
      members: allMembers,
      streamChannelId,
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic nativeLanguage learningLanguage");

    res.status(201).json({ success: true, group: populatedGroup });
  } catch (error) {
    console.error("Error in createGroup controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getUserGroups(req, res) {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic nativeLanguage learningLanguage")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getGroupDetails(req, res) {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId)
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic nativeLanguage learningLanguage");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member of the group
    if (!group.members.some(member => member._id.toString() === userId.toString())) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in getGroupDetails controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function addMemberToGroup(req, res) {
  try {
    const { id: groupId } = req.params;
    const { userId } = req.body;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if requester is admin
    if (group.admin.toString() !== requesterId.toString()) {
      return res.status(403).json({ message: "Only group admin can add members" });
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    group.members.push(userId);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json({ success: true, group: updatedGroup });
  } catch (error) {
    console.error("Error in addMemberToGroup controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function removeMemberFromGroup(req, res) {
  try {
    const { id: groupId } = req.params;
    const { userId } = req.body;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if requester is admin or removing themselves
    if (group.admin.toString() !== requesterId.toString() && userId !== requesterId.toString()) {
      return res.status(403).json({ message: "Not authorized to remove this member" });
    }

    // Don't allow admin to remove themselves if there are other members
    if (userId === group.admin.toString() && group.members.length > 1) {
      return res.status(400).json({ message: "Admin cannot leave group with other members. Transfer admin rights first." });
    }

    group.members = group.members.filter(member => member.toString() !== userId);
    await group.save();

    // If group is empty, delete it
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      return res.status(200).json({ success: true, message: "Group deleted as no members remain" });
    }

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json({ success: true, group: updatedGroup });
  } catch (error) {
    console.error("Error in removeMemberFromGroup controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}