import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Simulation() {
  const [vehicles, setVehicles] = useState([]);
  const [signal, setSignal] = useState("NONE");

  const WIDTH = 500;
  const HEIGHT = 500;

  // ===== FETCH =====
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await API.get("/traffic/live");
        setVehicles(res.data.vehicles || []);
        setSignal(res.data.signal || "NONE");
      } catch {}
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // ===== SCALE =====
  const xs = vehicles.map(v => v.x);
  const ys = vehicles.map(v => v.y);

  const minX = xs.length ? Math.min(...xs) : 0;
  const maxX = xs.length ? Math.max(...xs) : 1;
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxY = ys.length ? Math.max(...ys) : 1;

  const scaleX = WIDTH / (maxX - minX + 1);
  const scaleY = HEIGHT / (maxY - minY + 1);
  const SCALE = Math.min(scaleX, scaleY) * 0.9;

  const mapX = (x) => (x - minX) * SCALE;
  const mapY = (y) => HEIGHT - (y - minY) * SCALE;

  return (
    <div className="relative w-[500px] h-[500px] bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">

      {/* ===== STATIC ROADS (DO NOT MOVE) ===== */}
      <div className="absolute w-full h-20 bg-black top-1/2 -translate-y-1/2"></div>
      <div className="absolute h-full w-20 bg-black left-1/2 -translate-x-1/2"></div>

      {/* ===== SIGNAL ===== */}
      <div className="absolute top-2 left-2 text-sm text-white">
        🚦 {signal}
      </div>

      {/* ===== VEHICLES (REAL POSITIONS ONLY) ===== */}
      {vehicles.map(v => (
        <div
          key={v.id}
          className="absolute text-sm"
          style={{
            left: mapX(v.x),
            top: mapY(v.y),
            transform: "translate(-50%, -50%)",
            transition: "all 0.25s linear"
          }}
        >
          🚗
        </div>
      ))}

    </div>
  );
}