import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";             
import { Server } from "socket.io";    
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import leaseRoutes from "./routes/leaseRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import { setSocketIO } from "./controllers/messageController.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();
const server = http.createServer(app);  // <- wrap app with HTTP server

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
, 
    methods: ["GET", "POST"],
  },
});

setSocketIO(io);
// Connect DB
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);
app.use("/property", propertyRoutes);
app.use("/verify", verificationRoutes);
app.use("/messages", messageRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/reviews", reviewRoutes);
app.use("/applications", applicationRoutes);
app.use("/leases", leaseRoutes);
app.use("/payments", paymentRoutes);
app.use("/webhooks", webhookRoutes);
app.use("/revenue", revenueRoutes);
app.use("/notifications", notificationRoutes);
app.use("/users", userRoutes);

// Real-time messaging
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", (data) => {
    socket.to(data.roomId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

app.get("/notifications", (req, res) => {
  res.json([
    {
      _id: "1",
      type: "message",
      message: "Welcome to the app!",
      createdAt: new Date(),
      read: false,
    },
  ]);
});

// Basic fallback error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server 🏃 on port ${PORT}`));

export { io }; 
