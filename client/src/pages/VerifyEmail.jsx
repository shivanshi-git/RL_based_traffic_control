import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios"; // your axios instance

const VerifyEmail = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      return setMessage("Please enter email and OTP");
    }

    try {
      setLoading(true);

      const { data } = await API.post("/auth/verify-email-otp", {
        email,
        otp,
      });

      setMessage(data.message);

      // 🔥 Redirect after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#b4c6fc] to-[#c79dfc] px-4">
      <div className="bg-[#0b1533] w-full max-w-md rounded-2xl p-10 shadow-2xl">

        <h2 className="text-2xl font-semibold text-white text-center">
          Verify Your Email
        </h2>

        <p className="text-gray-400 text-center text-sm mb-8">
          Enter the OTP sent to your email
        </p>

        <form onSubmit={handleVerify}>

          {/* Email */}
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full mb-4 px-4 py-3 rounded-full bg-[#1b254b] text-white outline-none placeholder-gray-400 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* OTP */}
          <input
            type="text"
            placeholder="Enter 6 digit OTP"
            className="w-full mb-6 px-4 py-3 rounded-full bg-[#1b254b] text-white outline-none placeholder-gray-400 text-sm"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-white font-medium bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {message && (
          <p className="text-center text-sm mt-4 text-purple-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;