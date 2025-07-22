import express from "express";
import { handleChat } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/chatbot", handleChat); 

export default router;
