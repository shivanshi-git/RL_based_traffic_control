import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Register = () => {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/register", {
        name,
        email,
        password,
      });

      alert(res.data.message);
      navigate("/verify-email");

    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#b4c6fc] to-[#c79dfc] px-4">

      <div className="bg-[#0b1533] w-full max-w-md rounded-2xl p-10 shadow-2xl">

        <h2 className="text-2xl font-semibold text-white text-center">
          Create Account
        </h2>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-4 px-5 py-3 rounded-full bg-[#1b254b] text-white outline-none"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-5 py-3 rounded-full bg-[#1b254b] text-white outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 px-5 py-3 rounded-full bg-[#1b254b] text-white outline-none"
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-full text-white font-medium bg-gradient-to-r from-purple-500 to-indigo-500"
          >
            Register
          </button>

        </form>

      </div>
    </div>
  );
};

export default Register;