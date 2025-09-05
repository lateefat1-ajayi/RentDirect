import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/rentdirect";
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected to:", mongoURI);
  } catch (error) {
    console.error("MongoDB connection failed", error.message);
    console.log("Please check your MongoDB connection or create a .env file with MONGO_URI");
    process.exit(1);
  }
};

export default connectDB;
