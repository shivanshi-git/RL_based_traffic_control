import { useState } from "react";
import API from "../api/axios";

const ResetPassword = () => {

  const [email, setEmail] = useState("");

  const handleSendReset = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/forgot-password", {
        email,
      });

      alert(res.data.message);

    } catch (error) {
      alert(error.response?.data?.message || "Error sending reset email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#b4c6fc] to-[#c79dfc] px-4">

      <div className="bg-[#0b1533] w-full max-w-md rounded-2xl p-10 shadow-2xl">

        <h2 className="text-2xl font-semibold text-white text-center">
          Reset Password
        </h2>

        <p className="text-gray-400 text-center text-sm mb-8">
          Enter your email to reset password
        </p>

        <form onSubmit={handleSendReset}>

          <div className="flex items-center bg-[#1b254b] rounded-full px-5 py-3 mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-gray-400 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full text-white font-medium bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition"
          >
            Send Reset Link
          </button>

        </form>

      </div>
    </div>
  );
};

export default ResetPassword;