import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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
        "http://localhost:5000/api/auth/register",
        formData
      );

      alert(res.data.message);

      if (res.data.success) {
        navigate("/login");
      }
    } catch (error) {
      alert("Error registering user");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>🚦 Smart Traffic RL - Signup</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
          />

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

          <button type="submit">Register</button>
        </form>

        <button className="link-btn" onClick={() => navigate("/login")}>
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}

export default Signup;