import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMemberToGroup,
  removeMemberFromGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protectRoute);

router.post("/", createGroup);
router.get("/", getUserGroups);
router.get("/:id", getGroupDetails);
router.post("/:id/members", addMemberToGroup);
router.delete("/:id/members", removeMemberFromGroup);

export default router;