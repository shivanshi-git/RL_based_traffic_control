import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import API from "../api/axios";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      alert(res.data.message || "Login successful");

      // 🔥 Redirect after login
      navigate("/welcome");

    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#b4c6fc] to-[#c79dfc] px-4">

      <div className="bg-[#0b1533] w-full max-w-md rounded-2xl p-10 shadow-2xl">

        {/* Title */}
        <h2 className="text-2xl font-semibold text-white text-center">
          Login
        </h2>

        <p className="text-gray-400 text-center text-sm mb-8">
          Welcome back 👋
        </p>

        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="flex items-center bg-[#1b254b] rounded-full px-5 py-3 mb-4">
            <img src={assets.mail_icon} alt="" className="w-4 mr-3 opacity-60" />
            <input
              type="email"
              placeholder="Email id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-gray-400 text-sm"
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center bg-[#1b254b] rounded-full px-5 py-3 mb-3">
            <img src={assets.lock_icon} alt="" className="w-4 mr-3 opacity-60" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-gray-400 text-sm"
              required
            />
          </div>

          {/* Forgot Password */}
          <div className="mb-6">
            <Link 
              to="/reset-password" 
              className="text-sm text-purple-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-full text-white font-medium bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition"
          >
            Login
          </button>

        </form>

        {/* Bottom Text */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-purple-400 hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;