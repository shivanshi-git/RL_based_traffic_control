import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>🚦 Smart Traffic RL - Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <button type="submit">Login</button>
        </form>

        <button className="link-btn" onClick={() => navigate("/")}>
          Don't have an account? Signup
        </button>
      </div>
    </div>
  );
}

export default Login;