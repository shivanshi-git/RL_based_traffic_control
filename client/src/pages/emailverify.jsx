import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const EmailVerify = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/verify-email", { otp });
      alert(res.data.message);
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#b4c6fc] to-[#c79dfc] px-4">

      <div className="bg-[#0b1533] w-full max-w-md rounded-2xl p-10 shadow-2xl">

        <h2 className="text-2xl font-semibold text-white text-center mb-2">
          Verify Your Email
        </h2>

        <p className="text-gray-400 text-center text-sm mb-8">
          Enter the OTP sent to your email
        </p>

        <form onSubmit={handleVerify}>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full mb-6 px-5 py-3 rounded-full bg-[#1b254b] text-white outline-none text-center tracking-widest"
            maxLength={6}
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-full text-white font-medium bg-gradient-to-r from-purple-500 to-indigo-500"
          >
            Verify
          </button>

        </form>

      </div>
    </div>
  );
};

export default EmailVerify;