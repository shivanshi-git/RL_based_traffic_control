import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import transporter from "../config/nodemailer.js";

// ================= JWT =================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const rawVerifyToken = crypto.randomBytes(32).toString("hex");
    const hashedVerifyToken = crypto
      .createHash("sha256")
      .update(rawVerifyToken)
      .digest("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verifyToken: hashedVerifyToken,
      verifyTokenExpireAt: Date.now() + 24 * 60 * 60 * 1000,
      isVerified: false, // change to true if you want auto verify
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // EMAIL SENDING
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify/${rawVerifyToken}`;

    try {
      await transporter.sendMail({
        from: `"Your App" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify Your Email",
        html: `
          <h2>Hello ${name}</h2>
          <p>Click below to verify your email:</p>
          <a href="${verificationLink}">Verify Email</a>
        `,
      });

      console.log("Verification email sent successfully");
    } catch (emailError) {
      console.log("EMAIL ERROR:");
      console.log(emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};


export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      verifyToken: hashedToken,
      verifyTokenExpireAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpireAt = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.log("VERIFY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔥 TEMPORARY FIX FOR DEMO
    // Remove this block if you want strict verification
    if (!user.isVerified) {
      console.log("User not verified — auto verifying for now");
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login successful",
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
  res.clearCookie("token");
  return res.json({ success: true, message: "Logged out successfully" });
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  return res.json({ success: true, message: "Feature coming soon" });
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  return res.json({ success: true, message: "Feature coming soon" });
};