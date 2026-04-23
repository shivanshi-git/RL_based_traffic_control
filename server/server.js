import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";
import userAuth from "./middleware/userAuth.js";
import { initializeSimulation } from "./services/trafficSim.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);

// Protected route: check if user is logged in (used by frontend)
app.get("/api/auth/check", userAuth, (req, res) => {
  res.json({ success: true, userId: req.userId });
});

// Use fallback port
const PORT = process.env.PORT || 5000;

// Socket setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    credentials: true,
  }
});

// Initialize RL Traffic Simulation
initializeSimulation(io);

// Connect DB then start server
connectDB().then(() => {
  httpServer.listen(PORT, () =>
    console.log(`Server running on port ${PORT} with Sockets initialized`)
  );
}).catch((err) => {
  console.error("Failed to connect to MongoDB:", err.message);
  // Still start the server so simulation works even without DB
  httpServer.listen(PORT, () =>
    console.log(`Server running on port ${PORT} (DB unavailable)`)
  );
});