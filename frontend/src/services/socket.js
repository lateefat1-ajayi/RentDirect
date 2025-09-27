import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://rentdirect-uxsb.onrender.com";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  auth: {
    token: null // Will be set when connecting
  }
});

// Add connection event listeners for debugging
socket.on("connect", () => {
  console.log("🔌 Socket connected successfully");
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Socket disconnected:", reason);
});

socket.on("error", (error) => {
  console.error("❌ Socket error:", error);
});

export const joinRoom = (roomId) => {
  // Ensure socket has current token
  const currentToken = localStorage.getItem("token");
  if (currentToken && socket.auth.token !== currentToken) {
    socket.auth.token = currentToken;
    if (socket.connected) {
      socket.disconnect();
    }
    socket.connect();
  }
  
  if (socket.connected) {
    socket.emit("joinRoom", roomId);
  }
};

export const sendMessageSocket = (data) => {
  if (socket.connected) {
    socket.emit("sendMessage", {
      roomId: data.conversationId,
      message: data.message
    });
  }
};

export const emitTyping = (roomId, isTyping) => {
  if (socket.connected && roomId) {
    socket.emit("typing", { roomId, isTyping: !!isTyping });
  }
};

export const updateSocketToken = (newToken) => {
  if (socket.connected) {
    socket.disconnect();
  }
  socket.auth.token = newToken;
  socket.connect();
};

export const ensureSocketAuth = () => {
  const currentToken = localStorage.getItem("token");
  console.log("🔌 ensureSocketAuth - Current token:", currentToken ? "Present" : "Missing");
  console.log("🔌 ensureSocketAuth - Socket connected:", socket.connected);
  console.log("🔌 ensureSocketAuth - Socket auth token:", socket.auth.token);
  
  if (currentToken && socket.auth.token !== currentToken) {
    console.log("🔌 ensureSocketAuth - Updating token and reconnecting");
    socket.auth.token = currentToken;
    if (socket.connected) {
      socket.disconnect();
    }
    socket.connect();
  } else if (currentToken && !socket.connected) {
    console.log("🔌 ensureSocketAuth - Connecting with existing token");
    socket.auth.token = currentToken;
    socket.connect();
  } else if (!currentToken) {
    console.log("🔌 ensureSocketAuth - No token found, cannot connect");
  }
  
  return socket;
};

export default socket;
