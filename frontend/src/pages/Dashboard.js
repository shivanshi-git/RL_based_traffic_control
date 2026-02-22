import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="card" style={{ width: "500px" }}>
        <h2>🚦 Smart Traffic RL Dashboard</h2>

        <p><strong>Project:</strong> RL-Based Smart Traffic Signal Control</p>
        <p><strong>Algorithm:</strong> Q-Learning</p>
        <p><strong>Objective:</strong> Reduce waiting time & congestion</p>
        <p><strong>Status:</strong> System Active ✅</p>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Dashboard;