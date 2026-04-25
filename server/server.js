import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import https from "https";
import fs from "fs";
import { Server } from "socket.io";
import session from "express-session";
import passport from "./config/passport.js";

import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";
import trafficRoutes from "./routes/trafficRoutes.js";
import userAuth from "./middleware/userAuth.js";
import { initializeSimulation } from "./services/trafficSim.js";


const app = express();

// ================= MIDDLEWARE (ORDER MATTERS) =================
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["https://localhost:5173"],
  credentials: true,
}));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: "lax",
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/traffic", trafficRoutes);

app.get("/api/auth/check", userAuth, (req, res) => {
  res.json({ success: true, userId: req.userId });
});

app.get("/api/test", (req, res) => res.json({ ok: true }));

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔴 SERVER ERROR:", err.message);
  res.status(500).json({ error: err.message });
});

// ================= HTTPS =================
const options = {
  key: fs.readFileSync(process.env.CERT_KEY_PATH),
  cert: fs.readFileSync(process.env.CERT_PATH),
};

const httpsServer = https.createServer(options, app);

// ================= SOCKET.IO =================
const io = new Server(httpsServer, {
  cors: {
    origin: ["https://localhost:5173"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 SOCKET CONNECTED:", socket.id);
});

initializeSimulation(io);

// ================= START =================
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    httpsServer.listen(PORT, () => {
      console.log(`🚀 HTTPS Server running on https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB failed:", err.message);
    httpsServer.listen(PORT, () => {
      console.log(`⚠️ Server running without DB on https://localhost:${PORT}`);
    });
  });