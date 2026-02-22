import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import transporter from "../config/nodemailer.js";

// ============================================
// Helper: Generate JWT
// ============================================
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ============================================
// REGISTER
// ============================================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
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
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verifyToken: verificationToken,
      verifyTokenExpireAt: Date.now() + 24 * 60 * 60 * 1000,
      isVerified: false,
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify/${verificationToken}`;

    await transporter.sendMail({
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Email",
      html: `
        <h2>Hello ${name}</h2>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully. Please verify your email.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// VERIFY EMAIL
// ============================================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpireAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ success: false, message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpireAt = undefined;

    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ============================================
// LOGIN
// ============================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.json({ success: false, message: "Please verify email first" });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Logged in successfully",
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ============================================
// LOGOUT
// ============================================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token");

    return res.json({
      success: true,
      message: "Logged Out",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// FORGOT PASSWORD
// ============================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    return res.json({
      success: true,
      message: "Password reset email sent",
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ============================================
// RESET PASSWORD
// ============================================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ success: false, message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
