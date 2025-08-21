import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
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


dotenv.config();
const app = express();

// connect DB
connectDB();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

//error handler
app.use(notFound);
app.use(errorHandler);


// routes
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

// error handling (basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server 🏃 on port ${PORT}`));