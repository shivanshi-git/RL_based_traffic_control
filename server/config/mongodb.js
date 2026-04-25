import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);

    // 🔥 DEBUG LOGS
    console.log("🔗 MONGO URI:", process.env.MONGO_URI);
    console.log("📂 DB NAME:", mongoose.connection.name);
    console.log("🌐 HOST:", mongoose.connection.host);

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
};

export default connectDB;