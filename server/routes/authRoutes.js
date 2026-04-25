import express from "express";
import passport from "../config/passport.js";
import {
  register,
  login,
  logout,
  sendVerificationOtp,
  verifyEmailOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ================= AUTH =================
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// ================= EMAIL VERIFICATION =================
router.post("/send-verification-otp", sendVerificationOtp);
router.post("/verify-email-otp", verifyEmailOtp);

// ================= PASSWORD RESET =================
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ================= GOOGLE OAUTH =================
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://localhost:5173/login",
  }),
  (req, res) => {
    console.log("✅ Google auth success, user:", req.user?.displayName);

    // Generate JWT exactly like your normal login does
    const token = jwt.sign(
      { id: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie exactly like your normal login does
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("https://localhost:5173/setup-automation");
  }
);

export default router;