import { axiosInstance } from "./axios";

// Auth API calls
export const signup = async (userData) => {
  const response = await axiosInstance.post("/auth/signup", userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await axiosInstance.post("/auth/login", userData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

// User API calls
export const getRecommendedUsers = async () => {
  const response = await axiosInstance.get("/users");
  return response.data;
};

export const getUserFriends = async () => {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
};

export const sendFriendRequest = async (userId) => {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
};

export const acceptFriendRequest = async (requestId) => {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
};

export const getFriendRequests = async () => {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
};

export const getOutgoingFriendReqs = async () => {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
};

// Chat API calls
export const getStreamToken = async () => {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
};

// Group API calls
export const getUserGroups = async () => {
  const response = await axiosInstance.get("/groups");
  return response.data;
};

export const createGroup = async (groupData) => {
  const response = await axiosInstance.post("/groups", groupData);
  return response.data;
};

export const getGroupDetails = async (groupId) => {
  const response = await axiosInstance.get(`/groups/${groupId}`);
  return response.data;
};

export const addMemberToGroup = async (groupId, userId) => {
  const response = await axiosInstance.post(`/groups/${groupId}/members`, { userId });
  return response.data;
};

export const removeMemberFromGroup = async (groupId, userId) => {
  const response = await axiosInstance.delete(`/groups/${groupId}/members`, { data: { userId } });
  return response.data;
};

// Payment API calls
export const createPaymentOrder = async (amount) => {
  const response = await axiosInstance.post("/payment/create-order", { amount });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await axiosInstance.post("/payment/verify", paymentData);
  return response.data;
};

export const getPaymentDetails = async (paymentId) => {
  const response = await axiosInstance.get(`/payment/details/${paymentId}`);
  return response.data;
};