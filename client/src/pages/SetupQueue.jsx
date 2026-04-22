import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CAR_COLORS = [
  "#a78bfa", "#f472b6", "#38bdf8", "#fb923c", "#34d399",
  "#f87171", "#facc15", "#818cf8", "#22d3ee", "#e879f9",
];

const SetupQueue = () => {
  const navigate = useNavigate();

  const [queues, setQueues] = useState({
    north: 3,
    east: 5,
    south: 2,
    west: 4,
  });

  const labels = {
    north: "Gretaburgh",
    east: "Lake Gabriel",
    south: "Elinorburgh",
    west: "Blickfurt",
  };

  const handleChange = (dir, val) => {
    setQueues((prev) => ({
      ...prev,
      [dir]: Math.max(0, Math.min(10, parseInt(val) || 0)),
    }));
  };

  const handleStart = () => {
    const automationConfig = JSON.parse(
      localStorage.getItem("automationConfig") || "{}"
    );
    const fullConfig = { ...automationConfig, queues };
    localStorage.setItem("simulationConfig", JSON.stringify(fullConfig));
    navigate("/simulation");
  };

  // Generate random car colors for each queue
  const [carColors, setCarColors] = useState({});
  useEffect(() => {
    const colors = {};
    Object.keys(queues).forEach((dir) => {
      colors[dir] = Array.from({ length: 10 }, () =>
        CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]
      );
    });
    setCarColors(colors);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 font-['Inter',sans-serif]">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Back button */}
        <button
          onClick={() => navigate("/setup-automation")}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6 group"
        >
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-rose-400 font-medium">BACK</span>
        </button>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800 mb-8">Select Queue Length</h1>

        {/* Intersection Map */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-white/80 mb-6">
          <div className="relative w-full" style={{ paddingBottom: "100%" }}>
            <svg
              viewBox="0 0 500 500"
              className="absolute inset-0 w-full h-full"
              style={{ overflow: "visible" }}
            >
              {/* Grass / background */}
              <rect width="500" height="500" rx="20" fill="#e8f5e9" />

              {/* NS Road */}
              <rect x="195" y="0" width="110" height="500" fill="#455a64" />
              {/* EW Road */}
              <rect x="0" y="195" width="500" height="110" fill="#455a64" />

              {/* Road markings - NS */}
              <line x1="250" y1="0" x2="250" y2="185" stroke="#fff" strokeWidth="2" strokeDasharray="12,8" opacity="0.7" />
              <line x1="250" y1="315" x2="250" y2="500" stroke="#fff" strokeWidth="2" strokeDasharray="12,8" opacity="0.7" />

              {/* Road markings - EW */}
              <line x1="0" y1="250" x2="185" y2="250" stroke="#fff" strokeWidth="2" strokeDasharray="12,8" opacity="0.7" />
              <line x1="315" y1="250" x2="500" y2="250" stroke="#fff" strokeWidth="2" strokeDasharray="12,8" opacity="0.7" />

              {/* Intersection box */}
              <rect x="195" y="195" width="110" height="110" fill="#37474f" />

              {/* Crosswalk stripes NS top */}
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={`cw-n-${i}`} x={200 + i * 20} y="185" width="12" height="10" fill="white" opacity="0.8" />
              ))}
              {/* Crosswalk stripes NS bottom */}
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={`cw-s-${i}`} x={200 + i * 20} y="305" width="12" height="10" fill="white" opacity="0.8" />
              ))}
              {/* Crosswalk stripes EW left */}
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={`cw-w-${i}`} x="185" y={200 + i * 20} width="10" height="12" fill="white" opacity="0.8" />
              ))}
              {/* Crosswalk stripes EW right */}
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={`cw-e-${i}`} x="305" y={200 + i * 20} width="10" height="12" fill="white" opacity="0.8" />
              ))}

              {/* Traffic lights */}
              {/* North */}
              <circle cx="185" cy="175" r="6" fill="#4caf50" />
              <circle cx="185" cy="160" r="6" fill="#f44336" opacity="0.3" />
              {/* South */}
              <circle cx="315" cy="325" r="6" fill="#4caf50" />
              <circle cx="315" cy="340" r="6" fill="#f44336" opacity="0.3" />
              {/* East */}
              <circle cx="325" cy="185" r="6" fill="#f44336" />
              <circle cx="340" cy="185" r="6" fill="#4caf50" opacity="0.3" />
              {/* West */}
              <circle cx="175" cy="315" r="6" fill="#f44336" />
              <circle cx="160" cy="315" r="6" fill="#4caf50" opacity="0.3" />

              {/* CARS - North Queue (coming from top, going south) */}
              {Array.from({ length: Math.min(queues.north, 10) }).map((_, i) => (
                <g key={`car-n-${i}`}>
                  <rect
                    x="260"
                    y={145 - i * 35}
                    width="20"
                    height="30"
                    rx="5"
                    fill={carColors.north?.[i] || "#a78bfa"}
                    className="transition-all duration-500"
                  />
                  {/* Windshield */}
                  <rect x="263" y={149 - i * 35} width="14" height="6" rx="2" fill="rgba(255,255,255,0.4)" />
                </g>
              ))}

              {/* CARS - South Queue (coming from bottom, going north) */}
              {Array.from({ length: Math.min(queues.south, 10) }).map((_, i) => (
                <g key={`car-s-${i}`}>
                  <rect
                    x="220"
                    y={325 + i * 35}
                    width="20"
                    height="30"
                    rx="5"
                    fill={carColors.south?.[i] || "#f472b6"}
                    className="transition-all duration-500"
                  />
                  <rect x="223" y={345 + i * 35} width="14" height="6" rx="2" fill="rgba(255,255,255,0.4)" />
                </g>
              ))}

              {/* CARS - East Queue (coming from right, going west) */}
              {Array.from({ length: Math.min(queues.east, 10) }).map((_, i) => (
                <g key={`car-e-${i}`}>
                  <rect
                    x={325 + i * 40}
                    y="220"
                    width="30"
                    height="20"
                    rx="5"
                    fill={carColors.east?.[i] || "#38bdf8"}
                    className="transition-all duration-500"
                  />
                  <rect x={345 + i * 40} y="223" width="6" height="14" rx="2" fill="rgba(255,255,255,0.4)" />
                </g>
              ))}

              {/* CARS - West Queue (coming from left, going east) */}
              {Array.from({ length: Math.min(queues.west, 10) }).map((_, i) => (
                <g key={`car-w-${i}`}>
                  <rect
                    x={145 - i * 40}
                    y="260"
                    width="30"
                    height="20"
                    rx="5"
                    fill={carColors.west?.[i] || "#fb923c"}
                    className="transition-all duration-500"
                  />
                  <rect x={149 - i * 40} y="263" width="6" height="14" rx="2" fill="rgba(255,255,255,0.4)" />
                </g>
              ))}

              {/* Direction Labels with input badges */}
              {/* North label */}
              <foreignObject x="200" y="-45" width="100" height="40">
                <div className="flex flex-col items-center" xmlns="http://www.w3.org/1999/xhtml">
                  <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>{labels.north}</span>
                </div>
              </foreignObject>

              {/* South label */}
              <foreignObject x="200" y="510" width="100" height="40">
                <div className="flex flex-col items-center" xmlns="http://www.w3.org/1999/xhtml">
                  <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>{labels.south}</span>
                </div>
              </foreignObject>

              {/* East label */}
              <foreignObject x="440" y="235" width="100" height="40">
                <div className="flex flex-col items-start" xmlns="http://www.w3.org/1999/xhtml">
                  <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>{labels.east}</span>
                </div>
              </foreignObject>

              {/* West label */}
              <foreignObject x="-50" y="235" width="100" height="40">
                <div className="flex flex-col items-end" xmlns="http://www.w3.org/1999/xhtml">
                  <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>{labels.west}</span>
                </div>
              </foreignObject>
            </svg>
          </div>
        </div>

        {/* Queue Length Inputs */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-white/80 mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Queue Lengths per Direction
          </p>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(queues).map(([dir, val]) => (
              <div
                key={dir}
                className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100"
              >
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    {dir}
                  </p>
                  <p className="text-xs text-slate-500">{labels[dir]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleChange(dir, val - 1)}
                    className="w-7 h-7 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-sm text-slate-500 transition-colors shadow-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-indigo-600 text-lg">
                    {val}
                  </span>
                  <button
                    onClick={() => handleChange(dir, val + 1)}
                    className="w-7 h-7 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-sm text-slate-500 transition-colors shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Queue badges on map */}
          <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
            {Object.entries(queues).map(([dir, val]) => {
              const badgeColors = {
                north: "bg-violet-100 text-violet-600",
                east: "bg-sky-100 text-sky-600",
                south: "bg-pink-100 text-pink-600",
                west: "bg-orange-100 text-orange-600",
              };
              return (
                <span
                  key={dir}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${badgeColors[dir]}`}
                >
                  {dir.charAt(0).toUpperCase()}: {val} KM
                </span>
              );
            })}
          </div>
        </div>

        {/* Start Simulation Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
              text-white font-bold text-sm tracking-wider uppercase shadow-xl shadow-indigo-300/40
              hover:shadow-2xl hover:shadow-indigo-400/50 hover:scale-105 active:scale-95
              transition-all duration-300 flex items-center gap-3"
          >
            <span>🚀 Launch Simulation</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupQueue;
