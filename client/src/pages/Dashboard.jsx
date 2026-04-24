import Simulation from "../components/Simulation";
import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Dashboard() {
  const [live, setLive] = useState({});
  const [comparison, setComparison] = useState({});

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await API.get("/traffic/live");
        setLive(res.data);

        const comp = await API.get("/traffic/compare");
        setComparison(comp.data);

      } catch {}
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">
        🚀 Smart Traffic Control System
      </h1>

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT PANEL */}
        <div className="space-y-4">

          <div className="bg-gray-800 p-4 rounded-xl">
            🚦 Signal: {live.signal || "N/A"}
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            📊 Reward: {live.reward || 0}
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            🚗 Vehicles: {live.vehicles?.length || 0}
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            ⚡ RL Avg Queue: {comparison.RL_avg_queue || 0}
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            📉 Fixed Avg Queue: {comparison.FIXED_avg_queue || 0}
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            🚀 Improvement: {comparison.improvement || "0%"}
          </div>

        </div>

        {/* CENTER (SIMULATION) */}
        <div className="col-span-2 flex justify-center">
          <Simulation />
        </div>

      </div>
    </div>
  );
}