import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import User from "./models/User.js";

import authRoutes from "./routes/authRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import landlordRoutes from "./routes/landlordRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import leaseRoutes from "./routes/leaseRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import { sendEmail } from "./utils/mailer.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io available to route handlers/controllers
app.set("io", io);

// Connect DB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Test email route
app.get("/test-email", async (req, res) => {
  try {
    await sendEmail("your_email@gmail.com", "Test", "<p>Hello</p>");
    res.send("Email sent");
  } catch (err) {
    console.error("Test email error:", err);
    res.status(500).send("Failed to send email");
  }
});

// Test admin route (temporary)
app.get("/test-admin", async (req, res) => {
  try {
    const User = (await import("./models/User.js")).default;
    const landlords = await User.find({ role: "landlord" }).countDocuments();
    res.json({ message: "Admin route working", landlordsCount: landlords });
  } catch (err) {
    console.error("Test admin error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Test database route (temporary)
app.get("/test-db", async (req, res) => {
  try {
    const Property = (await import("./models/Property.js")).default;
    const Application = (await import("./models/Application.js")).default;
    
    const propertiesCount = await Property.countDocuments();
    const applicationsCount = await Application.countDocuments();
    
    const sampleProperty = await Property.findOne().populate("landlord", "name email");
    const sampleApplication = await Application.findOne().populate("tenant property", "name title");
    
    res.json({ 
      message: "Database test route working", 
      propertiesCount,
      applicationsCount,
      sampleProperty: sampleProperty ? {
        id: sampleProperty._id,
        title: sampleProperty.title,
        landlord: sampleProperty.landlord
      } : null,
      sampleApplication: sampleApplication ? {
        id: sampleApplication._id,
        tenant: sampleApplication.tenant,
        property: sampleApplication.property,
        status: sampleApplication.status
      } : null
    });
  } catch (err) {
    console.error("Test database error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Test connection route (no auth required)
app.get("/test-connection", (req, res) => {
  res.json({ message: "Backend connection working", timestamp: new Date().toISOString() });
});

// Middleware to attach socket.io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/property", propertyRoutes);
app.use("/verify", verificationRoutes);
app.use("/landlord", landlordRoutes);
app.use("/conversations", conversationRoutes); // conversations+messages
app.use("/favorites", favoriteRoutes);
app.use("/reviews", reviewRoutes);
app.use("/applications", applicationRoutes);
app.use("/leases", leaseRoutes);
app.use("/payments", paymentRoutes);
app.use("/webhooks", webhookRoutes);
app.use("/revenue", revenueRoutes);
app.use("/notifications", notificationRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/contact", contactRoutes);
app.use("/reports", reportRoutes);
app.use("/share", shareRoutes);

// Socket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    console.log("🔌 Socket auth attempt - Token:", token ? "Present" : "Missing");
    console.log("🔌 Socket auth attempt - Socket ID:", socket.id);
    
    if (!token) {
      console.log("❌ Socket auth failed - No token provided");
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔌 Socket auth - JWT decoded:", { id: decoded.id, email: decoded.email });
    
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      console.log("❌ Socket auth failed - User not found");
      return next(new Error("Authentication error: User not found"));
    }

    // Attach user info to socket
    socket.userId = user._id;
    socket.userRole = user.role;
    socket.userEmail = user.email;
    
    console.log(`✅ Socket authenticated for user: ${user.email} (${user.role}) - ID: ${user._id}`);
    next();
  } catch (error) {
    console.error("❌ Socket authentication error:", error.message);
    next(new Error("Authentication error: Invalid token"));
  }
});

// Real-time messaging with Socket.IO
io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id} (User: ${socket.userEmail})`);

  // Join user's personal room for notifications
  socket.join(`user_${socket.userId}`);
  console.log(`${socket.userEmail} joined notification room: user_${socket.userId}`);

  // Join a conversation room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.userEmail} joined room ${roomId}`);
  });

  // Typing indicator events
  socket.on("typing", ({ roomId, isTyping }) => {
    if (!roomId) return;
    // Broadcast to everyone else in the room that this user is typing
    socket.to(roomId).emit("typing", {
      conversationId: roomId,
      userId: socket.userId,
      isTyping: !!isTyping,
    });
  });

  // Handle sending a message
  socket.on("sendMessage", (data) => {
    const { roomId, message } = data;
    console.log(`Message in room ${roomId} from ${socket.userEmail}:`, message);
    
    // Don't emit here - let the backend handle the message and emit it
    // The backend will emit the message with proper sender information
    console.log(`Socket received message, but backend will handle emission`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id} (User: ${socket.userEmail})`);
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Basic fallback error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
// Function to check expired leases
const checkExpiredLeases = async () => {
  try {
    const Lease = (await import("./models/Lease.js")).default;
    const Property = (await import("./models/Property.js")).default;
    
    const currentDate = new Date();
    
    // Find all active leases that have expired
    const expiredLeases = await Lease.find({
      status: "active",
      endDate: { $lt: currentDate }
    }).populate("property");

    if (expiredLeases.length > 0) {
      console.log(`Found ${expiredLeases.length} expired leases`);

      // Update expired leases and their properties
      for (const lease of expiredLeases) {
        // Update lease status to expired
        lease.status = "expired";
        await lease.save();

        // Update property status to available
        if (lease.property) {
          lease.property.status = "available";
          await lease.property.save();
          console.log(`Updated property ${lease.property.title} status to available`);
        }
      }
    }
  } catch (error) {
    console.error("Error checking expired leases:", error);
  }
};

// Check expired leases every hour
setInterval(checkExpiredLeases, 60 * 60 * 1000); // 1 hour

// Check expired leases on startup
checkExpiredLeases();

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { io };
