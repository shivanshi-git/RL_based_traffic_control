import { Link } from "react-router-dom"
import { assets } from "../assets/assets"

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#b4c6fc] to-[#c79dfc] px-4">

      {/* Card */}
      <div className="bg-[#0b1533] w-full max-w-md rounded-2xl p-10 shadow-2xl">

        {/* Title */}
        <h2 className="text-2xl font-semibold text-white text-center">
          Create Account
        </h2>

        <p className="text-gray-400 text-center text-sm mb-8">
          Create your account
        </p>

        {/* Full Name */}
        <div className="flex items-center bg-[#1b254b] rounded-full px-5 py-3 mb-4">
          <img src={assets.person_icon} alt="" className="w-4 mr-3 opacity-60" />
          <input
            type="text"
            placeholder="Full Name"
            className="bg-transparent outline-none text-white w-full placeholder-gray-400 text-sm"
          />
        </div>

        {/* Email */}
        <div className="flex items-center bg-[#1b254b] rounded-full px-5 py-3 mb-4">
          <img src={assets.mail_icon} alt="" className="w-4 mr-3 opacity-60" />
          <input
            type="email"
            placeholder="Email id"
            className="bg-transparent outline-none text-white w-full placeholder-gray-400 text-sm"
          />
        </div>

        {/* Password */}
        <div className="flex items-center bg-[#1b254b] rounded-full px-5 py-3 mb-3">
          <img src={assets.lock_icon} alt="" className="w-4 mr-3 opacity-60" />
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent outline-none text-white w-full placeholder-gray-400 text-sm"
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


        {/* Sign Up Button */}
        <button className="w-full py-3 rounded-full text-white font-medium bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition">
          Sign Up
        </button>

        {/* Bottom Text */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login
