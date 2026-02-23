import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Email verification
    verifyToken: { type: String, default: null },
    verifyTokenExpireAt: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },

    // Password reset
    resetToken: { type: String, default: null },
    resetTokenExpire: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;