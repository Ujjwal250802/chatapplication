import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
  console.log("API Key exists:", !!apiKey);
  console.log("API Secret exists:", !!apiSecret);
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    if (!apiKey || !apiSecret) {
      throw new Error("Stream credentials not configured");
    }
    
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    if (!apiKey || !apiSecret) {
      throw new Error("Stream credentials not configured");
    }
    
    // ensure userId is a string
    const userIdStr = userId.toString();
    const token = streamClient.createToken(userIdStr);
    
    console.log("Generated token for user:", userIdStr);
    return token;
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
};