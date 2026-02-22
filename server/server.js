import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import nodemailer from 'nodemailer'
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";
import transporter from "./config/nodemailer.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL (change if needed)
    credentials: true,
  })
);

// API Test Route
app.get("/", (req, res) => res.send("API Working"));

// Auth Routes
app.use("/api/auth", authRoutes);

// Start Server
app.listen(port, () =>
  console.log(`Server started on PORT: ${port}`)
);
