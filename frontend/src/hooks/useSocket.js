import { useEffect } from "react";
import socket, { ensureSocketAuth } from "../services/socket";

export default function useSocket(onMessage) {
  useEffect(() => {
    console.log("🔌 useSocket - Hook mounted, socket connected:", socket.connected);
    
    // Ensure socket is authenticated and connected
    ensureSocketAuth();
    
    // Wait a bit for connection, then set up listeners
    const setupSocket = () => {
      if (socket.connected) {
        console.log("🔌 useSocket - Socket connected, setting up message listeners");
        if (onMessage) {
          socket.on("receiveMessage", onMessage);
          socket.on("messageUpdated", onMessage);
          socket.on("messageDeleted", onMessage);
        }
      } else {
        console.log("🔌 useSocket - Socket not connected, waiting...");
        // Wait for connection
        socket.once("connect", () => {
          console.log("🔌 useSocket - Socket connected, setting up message listeners");
          if (onMessage) {
            socket.on("receiveMessage", onMessage);
            socket.on("messageUpdated", onMessage);
            socket.on("messageDeleted", onMessage);
          }
        });
      }
    };
    
    setupSocket();

    // Cleanup
    return () => {
      if (onMessage) {
        console.log("🔌 useSocket - Cleaning up message listeners");
        socket.off("receiveMessage", onMessage);
        socket.off("messageUpdated", onMessage);
        socket.off("messageDeleted", onMessage);
      }
    };
  }, [onMessage]);

  return socket;
}
